import Link from "next/link";
import { Button } from "~/components/ui/button";

export function CallToAction() {
  return (
    <section className="bg-accent/90 text-primary py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6">
            Ready to transform your community?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg opacity-90 mb-8">
            Join thousands of community members building stronger local
            economies through mutual credit systems.
          </p>
        </div>

        <div className="flex justify-center">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="https://grassecon.substack.com" target="_blank" className="flex items-center gap-3">
              <svg 
                className="w-5 h-5 fill-current" 
                role="img" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
              </svg>
              Subscribe to Our Newsletter
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
