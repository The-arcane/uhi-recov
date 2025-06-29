export default function Footer() {
    const currentYear = new Date().getFullYear();
  
    return (
      <footer className="bg-card shadow-inner mt-auto">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {currentYear} Recovery Planner. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }
  