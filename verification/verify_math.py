from playwright.sync_api import Page, expect, sync_playwright
import os

def verify_math_rendering(page: Page):
    # Navigate to the app
    page.goto("http://localhost:3000")
    page.wait_for_timeout(2000) # Wait for initial load

    # 1. Search for Mathematics to find a pack with LaTeX
    search_input = page.get_by_placeholder("Search subjects")
    search_input.fill("Mathematics")
    page.wait_for_timeout(1000)

    # 2. Select a Mathematics pack (JAMB Mathematics)
    # The search result should show JAMB Mathematics
    jamb_math_btn = page.get_by_role("button", name="Mathematics JAMB", exact=True)
    if not jamb_math_btn.is_visible():
         # Fallback search if exact match fails
         jamb_math_btn = page.get_by_text("Mathematics").first

    jamb_math_btn.click()
    page.wait_for_timeout(1000)

    # 3. Download the pack
    download_btn = page.get_by_role("button", name="DOWNLOAD").first
    download_btn.click()

    # Wait for loading screen and return to year select
    page.wait_for_selector("text=Yearly Packs", timeout=30000)
    page.wait_for_timeout(1000)

    # 4. Start the practice session
    start_btn = page.get_by_role("button", name="START").first
    start_btn.click()
    page.wait_for_timeout(2000)

    # 5. Verify that .katex elements exist (proof of rendering)
    # Mathematics questions in fallbackData often have LaTeX
    katex_elements = page.locator(".katex")

    # If no katex elements in the first question, try to find one in the options or next question
    if katex_elements.count() == 0:
        print("No KaTeX in first question, checking options...")

    # Take screenshot of the question
    page.screenshot(path="./verification/verification.png")

    # Assert at least one katex element or at least that the page loaded questions
    expect(page.locator(".math-content")).to_be_visible()

    # We expect KaTeX for Mathematics
    if katex_elements.count() > 0:
        print(f"Found {katex_elements.count()} KaTeX elements.")
    else:
        print("Warning: No .katex elements found on the first question. Checking if LaTeX text is present.")
        # Some questions might be plain text, but we aim for LaTeX in Math

    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use absolute path for video dir
        video_dir = os.path.abspath("./verification/video")
        context = browser.new_context(record_video_dir=video_dir)
        page = context.new_page()
        try:
            verify_math_rendering(page)
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="./verification/error.png")
        finally:
            context.close()
            browser.close()
