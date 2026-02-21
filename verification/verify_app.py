from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        print("Navigating to http://localhost:5173/...")
        try:
            # Go to root, should redirect to /auth
            page.goto("http://localhost:5173/")

            # Wait for the "Giriş Yap" text which confirms AuthPage loaded
            page.wait_for_selector("text=Giriş Yap", timeout=20000)
            print("Successfully loaded Auth Page")

            # Take screenshot
            page.screenshot(path="verification/auth_page.png")
            print("Screenshot saved to verification/auth_page.png")

        except Exception as e:
            print(f"Error: {e}")
            # Take screenshot anyway to debug
            page.screenshot(path="verification/error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    # Give the server a moment to start up if it hasn't already
    time.sleep(5)
    run()
