import Routes from "./Routes";
import Footer from "./components/Footer";

export default function Index () {
  return (
    <div className="page-wrapper">
      <main className="page-content">
        <Routes />
      </main>
      <Footer />
    </div>
  );
}
