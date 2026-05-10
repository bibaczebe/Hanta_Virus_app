import DemoBanner from './DemoBanner.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function Layout({ children, headerProps = {} }) {
  return (
    <div className="min-h-screen bg-financial-navy text-financial-text font-sans flex flex-col">
      <div className="sticky top-0 z-40 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.8)]">
        <DemoBanner />
        <Header {...headerProps} />
      </div>
      <main className="flex-1 pt-2">{children}</main>
      <Footer />
    </div>
  );
}
