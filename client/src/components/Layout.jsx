import DemoBanner from './DemoBanner.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function Layout({ children, headerProps = {} }) {
  return (
    <div className="min-h-screen bg-financial-navy text-financial-text font-sans flex flex-col">
      <div className="sticky top-0 z-40">
        <DemoBanner />
        <Header {...headerProps} />
      </div>
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
