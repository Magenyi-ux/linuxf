import React, { useCallback, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Mail, Send, RefreshCw, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

type Campaign = { id: string; subject: string; status: string; total_recipients: number; sent_count: number; failed_count: number; created_at: string; };
type StatusResponse = { campaign?: Campaign; done?: boolean; error?: string };

export const AdminEmailCampaigns: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [history, setHistory] = useState<Campaign[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirmSend, setConfirmSend] = useState(false);

  const invoke = async (payload: Record<string, unknown>): Promise<StatusResponse> => {
    const { data, error: invokeError } = await supabase.functions.invoke('admin-bulk-email', { body: payload });
    if (invokeError) throw new Error(invokeError.message || 'Email service request failed.');
    if (data?.error) throw new Error(data.error);
    return data as StatusResponse;
  };

  const refreshHistory = useCallback(async () => {
    // Campaign data is intentionally only readable through the admin-checked Edge Function.
    try {
      const data = await invoke({ action: 'list_campaigns' });
      setHistory(Array.isArray((data as any).campaigns) ? (data as any).campaigns : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load campaign history.');
    }
  }, []);

  const createCampaign = async () => {
    setBusy(true); setError(''); setNotice(''); setConfirmSend(false);
    try {
      const result = await invoke({ action: 'create_campaign', subject: subject.trim(), body_text: bodyText.trim(), body_html: bodyHtml.trim() || undefined });
      if (!result.campaign) throw new Error('Campaign was created without a campaign record in the response.');
      setCampaign(result.campaign);
      setNotice('Campaign prepared. No email has been sent yet. Review the recipient count before starting delivery.');
      await refreshHistory();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not prepare campaign.'); }
    finally { setBusy(false); }
  };

  const processCampaign = async (campaignId: string, action: 'process_batch' | 'retry_failed') => {
    setBusy(true); setError(''); setNotice('');
    try {
      let result = await invoke({ action, campaign_id: campaignId });
      if (action === 'retry_failed') {
        setNotice('Failed recipients queued for retry. Delivery will start when you press Continue sending.');
      } else {
        let rounds = 0;
        while (!result.done && rounds < 100) {
          result = await invoke({ action: 'process_batch', campaign_id: campaignId });
          rounds += 1;
          if (result.campaign) setCampaign(result.campaign);
        }
        if (result.campaign) setCampaign(result.campaign);
        setNotice(result.done ? 'Campaign processing finished. Review sent and failed counts below.' : 'Processing paused after 100 batches. Press Continue sending to resume.');
      }
      await refreshHistory();
    } catch (e) { setError(e instanceof Error ? e.message : 'Email delivery failed.'); }
    finally { setBusy(false); }
  };

  const loadStatus = async (campaignId: string) => {
    setBusy(true); setError('');
    try { const r = await invoke({ action: 'campaign_status', campaign_id: campaignId }); if (r.campaign) setCampaign(r.campaign); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load campaign status.'); }
    finally { setBusy(false); }
  };

  return <div className="space-y-5">
    <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-5">
        <div className="rounded-2xl bg-primary-50 p-3 text-primary-700"><Mail className="h-5 w-5" /></div>
        <div><h2 className="text-lg font-black text-gray-900">Email campaigns</h2><p className="mt-1 text-sm text-gray-500">Send an email to accounts registered in the shared Examply Supabase Auth project. Creating a campaign only prepares it; delivery starts after explicit confirmation.</p></div>
      </div>
      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
      {notice && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</div>}
      <div className="space-y-4">
        <label className="block text-sm font-bold text-gray-700">Subject<input value={subject} onChange={e=>setSubject(e.target.value)} maxLength={180} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-primary-500" placeholder="Email subject" /></label>
        <label className="block text-sm font-bold text-gray-700">Plain-text message<textarea value={bodyText} onChange={e=>setBodyText(e.target.value)} rows={7} maxLength={20000} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-primary-500" placeholder="Write the message. This is sent as the text alternative." /></label>
        <details className="rounded-xl border border-gray-200 p-4"><summary className="cursor-pointer text-sm font-bold text-gray-700">Optional HTML email</summary><textarea value={bodyHtml} onChange={e=>setBodyHtml(e.target.value)} rows={8} maxLength={40000} className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 font-mono text-xs outline-none focus:ring-2 focus:ring-primary-500" placeholder="<h1>Hello</h1><p>Your message...</p>" /></details>
        <div className="flex flex-wrap gap-3"><button disabled={busy || !subject.trim() || !bodyText.trim()} onClick={()=>void createCampaign()} className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-black text-white disabled:opacity-40"><Mail className="h-4 w-4"/>{busy ? 'Working…' : 'Prepare campaign'}</button><button onClick={()=>void refreshHistory()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 disabled:opacity-40"><RefreshCw className="h-4 w-4"/>Refresh history</button></div>
      </div>
    </section>
    {campaign && <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-black text-gray-900">Selected campaign</h3><p className="mt-1 break-all font-mono text-xs text-gray-500">{campaign.id}</p><p className="mt-3 font-bold text-gray-800">{campaign.subject}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4"><Metric label="Status" value={campaign.status}/><Metric label="Recipients" value={campaign.total_recipients}/><Metric label="Sent" value={campaign.sent_count}/><Metric label="Failed" value={campaign.failed_count}/></div>
      <div className="mt-5 flex flex-wrap gap-3">
        {!confirmSend ? <button disabled={busy || !campaign.total_recipients} onClick={()=>setConfirmSend(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-black text-white disabled:opacity-40"><Send className="h-4 w-4"/>Continue sending</button> : <div className="w-full rounded-2xl border border-amber-300 bg-amber-50 p-4"><p className="flex items-center gap-2 text-sm font-black text-amber-900"><AlertTriangle className="h-4 w-4"/>Confirm bulk email</p><p className="my-2 text-sm text-amber-900">This will send “{campaign.subject}” to up to {campaign.total_recipients} registered accounts. Confirm only if the recipients should receive this message.</p><div className="flex gap-2"><button disabled={busy} onClick={()=>void processCampaign(campaign.id,'process_batch')} className="rounded-xl bg-amber-700 px-4 py-2 text-sm font-black text-white">Confirm and send</button><button onClick={()=>setConfirmSend(false)} className="rounded-xl border border-amber-300 px-4 py-2 text-sm font-bold text-amber-900">Cancel</button></div></div>}
        <button disabled={busy} onClick={()=>void loadStatus(campaign.id)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700">Refresh status</button>
        {campaign.failed_count > 0 && <button disabled={busy} onClick={()=>void processCampaign(campaign.id,'retry_failed')} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-700"><RotateCcw className="h-4 w-4"/>Queue failed for retry</button>}
      </div>
    </section>}
    <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-lg font-black text-gray-900">Campaign history</h3><button onClick={()=>void refreshHistory()} className="text-sm font-bold text-primary-700">Refresh</button></div>
      {history.length===0 ? <p className="text-sm text-gray-500">No campaign history loaded yet. Select Refresh history.</p> : <div className="space-y-2">{history.map(c=><button key={c.id} onClick={()=>{setCampaign(c);void loadStatus(c.id)}} className="w-full rounded-xl border border-gray-100 p-4 text-left hover:border-primary-200"><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-bold text-gray-900">{c.subject}</span><span className="text-xs font-black uppercase text-gray-500">{c.status}</span></div><p className="mt-1 text-xs text-gray-500">{c.total_recipients} recipients · {c.sent_count} sent · {c.failed_count} failed · {new Date(c.created_at).toLocaleString()}</p></button>)}</div>}
      <p className="mt-4 flex items-start gap-2 text-xs text-gray-500"><CheckCircle2 className="h-4 w-4 shrink-0"/>Use this for legitimate service updates and messages users expect. For promotional campaigns, honor consent and unsubscribe preferences.</p>
    </section>
  </div>;
};

const Metric: React.FC<{label:string;value:string|number}> = ({label,value}) => <div className="rounded-xl bg-gray-50 p-3"><p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</p><p className="mt-1 break-words text-lg font-black text-gray-900">{value}</p></div>;
