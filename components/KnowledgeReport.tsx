
import React from 'react';
import { BookOpen, FileText, Activity, Hash, Layers, HelpCircle, Lightbulb, ClipboardList, Share2, Info } from 'lucide-react';
import { MathText } from './MathText';
import { KnowledgeUnit, KnowledgeUnitType } from '../services/knowledgeService';

interface KnowledgeReportProps {
  topic: string;
  subject: string;
  coverage: number;
  units: { type: KnowledgeUnitType; content: string; metadata?: string }[];
  command: string;
}

const unitIcons: Record<string, React.ElementType> = {
  definition: Info,
  law: BookOpen,
  formula: Hash,
  diagram: Activity,
  example: Lightbulb,
  question: HelpCircle,
  quiz: ClipboardList,
  note: FileText,
  deepnote: Layers,
  relationship: Share2
};

export const KnowledgeReport: React.FC<KnowledgeReportProps | any> = (props) => {
  if (props.type === 'compare') {
      return (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm my-2">
              <div className="bg-indigo-600 p-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">COMPARISON REPORT</span>
                  <h3 className="text-xl font-black">{props.topics[0].name.replace(/_/g, ' ')} vs {props.topics[1].name.replace(/_/g, ' ')}</h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                  {props.topics.map((t: any, i: number) => (
                      <div key={i} className="space-y-3">
                          <h4 className="font-black text-primary-600 uppercase text-xs border-b border-primary-100 pb-1">{t.name.replace(/_/g, ' ')}</h4>
                          {t.units.slice(0, 3).map((u: any, j: number) => (
                              <div key={j} className="text-xs text-gray-600">
                                  <div className="font-bold text-[9px] uppercase text-gray-400">{u.type}</div>
                                  <MathText text={u.content} />
                              </div>
                          ))}
                      </div>
                  ))}
              </div>
          </div>
      );
  }

  if (props.type === 'roadmap') {
      return (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm my-2">
              <div className="bg-emerald-600 p-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{props.subject} ROADMAP</span>
                  <h3 className="text-xl font-black">Learning Path</h3>
              </div>
              <div className="p-6">
                  <div className="space-y-4 relative">
                      <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                      {props.topics.map((t: string, i: number) => (
                          <div key={i} className="flex items-center gap-4 relative">
                              <div className="w-5 h-5 rounded-full bg-emerald-100 border-4 border-white shadow-sm z-10"></div>
                              <span className="text-sm font-bold text-gray-700 capitalize">{t.replace(/_/g, ' ')}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  }

  const { topic, subject, coverage, units, command } = props;
  const formattedTopic = topic.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm my-2">
      {/* Header */}
      <div className="bg-primary-600 p-4 text-white">
        <div className="flex justify-between items-start mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{subject} KNOWLEDGE REPORT</span>
          <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">Coverage: {coverage}%</span>
        </div>
        <h3 className="text-xl font-black">{formattedTopic}</h3>
        <div className="text-[10px] font-mono opacity-60 mt-1 italic">Executed: {command}</div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {units.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Layers className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm font-medium">No knowledge units found for this query.</p>
          </div>
        ) : (
          units.map((unit, idx) => {
            const Icon = unitIcons[unit.type] || Info;
            return (
              <div key={idx} className="group">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 bg-primary-50 rounded-lg text-primary-600">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{unit.type}</span>
                </div>
                <div className="pl-9">
                  <div className="text-sm text-gray-700 leading-relaxed font-medium">
                    <MathText text={unit.content} />
                  </div>
                  {unit.metadata && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 font-mono">
                      <MathText text={unit.metadata} />
                    </div>
                  )}
                </div>
                {idx < units.length - 1 && <div className="mt-4 border-b border-gray-50" />}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-3 border-t border-gray-100">
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
          EXAMPLY KNOWLEDGE CORE v1.0
        </div>
      </div>
    </div>
  );
};
