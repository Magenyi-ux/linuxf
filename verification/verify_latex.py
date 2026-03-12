from playwright.sync_api import sync_playwright, expect
import time

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Navigate to the app
        page.goto("http://localhost:3000")
        time.sleep(2) # Wait for initial render

        # 2. Select JAMB
        page.get_by_role("button", name="JAMB Joint Admissions &").click()

        # 3. Select Science
        page.get_by_text("Science", exact=True).click()

        # 4. Select Mathematics
        page.get_by_text("Mathematics", exact=True).click()

        # 5. Start a session for 2025
        page.get_by_text("2025 Papers").first.wait_for()

        # Click DOWNLOAD for 2025 row
        page.locator(".group", has_text="2025 Papers").get_by_role("button", name="DOWNLOAD").click()

        # Wait for download
        time.sleep(2)

        # Take screenshot of year select after download
        page.screenshot(path="verification/year_select_after_download.png")

        # Click START
        start_btn = page.locator(".group", has_text="2025 Papers").get_by_role("button", name="START")
        if start_btn.is_visible():
            start_btn.click()
        else:
            print("START button not visible, taking debug screenshot")
            page.screenshot(path="verification/debug_start_not_found.png")
            return

        # 6. Verify practice session loads
        time.sleep(2)
        page.screenshot(path="verification/practice_session.png")

        # 7. Check for LaTeX
        # Let's try to find any math-content
        math_content = page.locator(".math-content")
        if math_content.count() > 0:
            print(f"Found {math_content.count()} math-content elements")
            # Check for katex inside
            katex_el = page.locator(".katex")
            print(f"Found {katex_el.count()} katex elements")

        browser.close()

if __name__ == "__main__":
    run_verification()
