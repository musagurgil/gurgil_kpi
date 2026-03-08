import time
from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 1. Login
        print("Logging in...")
        page.goto("http://localhost:5173/auth")

        # Fill email
        page.get_by_label("E-posta").fill("admin@gurgil.com")

        # Fill password
        page.get_by_label("Şifre", exact=True).fill("123456")

        # Submit
        page.get_by_role("button", name="Giriş Yap").click()

        # Wait for dashboard to load
        print("Waiting for dashboard...")
        page.wait_for_url("http://localhost:5173/", timeout=10000)

        # 2. Go to Users page
        print("Navigating to users page...")
        page.goto("http://localhost:5173/users")

        # Wait for network idle to ensure users are loaded
        page.wait_for_load_state("networkidle")

        # 3. Open "Create User" dialog
        print("Opening Create User dialog...")
        page.get_by_role("button", name="Yeni Kullanıcı").click()
        time.sleep(1) # wait for animation

        # 4. Fill a dummy password to activate the toggle button (optional but good for screenshot)
        page.get_by_label("Şifre", exact=True).fill("test_password")

        # 5. Take Screenshot
        print("Taking screenshot...")
        page.screenshot(path="success_ux_improvements.png")
        print("Done!")

        browser.close()

if __name__ == "__main__":
    verify()
