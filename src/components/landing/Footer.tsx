export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-xs sm:text-sm text-muted-foreground">
          <div className="mb-4 md:mb-0">
            © 2025 Sarafu Network. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a
              href="https://grassecon.org/pages/terms-and-conditions"
              target="_blank"
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="https://docs.grassecon.org/commons/data_policy/"
              target="_blank"
              className="hover:text-foreground transition-colors"
            >
              Data Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
