import { useNavigate } from 'react-router-dom';
import './Home.css';
import {
  AccessTime,
  FamilyRestroom,
  DirectionsCar,
  CheckCircle,
  ArrowForward
} from '@mui/icons-material';

export function Home() {
  const navigate = useNavigate();

  const navigateToServices = () => {
    navigate('/services');
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to Assured</h1>
        <p className="subtitle">Your trusted partner for all insurance needs</p>
      </header>

      <div className="insurance-sections">
        <section className="insurance-card">
          <div className="insurance-icon">
            <AccessTime fontSize="large" color="primary" />
          </div>
          <h2>Short Term Insurance</h2>
          <p className="insurance-description">
            Protect what matters now with our flexible short-term coverage options.
            Whether you're traveling, hosting an event, or protecting your gadgets,
            we've got you covered for the short term with comprehensive protection.
          </p>
          <div className="coverage-list">
            <p><CheckCircle color="success" fontSize="small" /> Travel Insurance</p>
            <p><CheckCircle color="success" fontSize="small" /> Gadget Insurance</p>
            <p><CheckCircle color="success" fontSize="small" /> Event Insurance</p>
          </div>
          <button
            onClick={navigateToServices}
            className="cta-button"
          >
            Explore Short Term Options <ArrowForward />
          </button>
        </section>

        <section className="insurance-card">
          <div className="insurance-icon">
            <FamilyRestroom fontSize="large" color="primary" />
          </div>
          <h2>Life Insurance</h2>
          <p className="insurance-description">
            Secure your family's future with our life insurance solutions.
            Choose from term life, whole life, or family cover options
            that provide financial protection when your loved ones need it most.
          </p>
          <div className="coverage-list">
            <p><CheckCircle color="success" fontSize="small" /> Term Life Insurance</p>
            <p><CheckCircle color="success" fontSize="small" /> Whole Life Insurance</p>
            <p><CheckCircle color="success" fontSize="small" /> Family Cover</p>
          </div>
          <button
            onClick={navigateToServices}
            className="cta-button"
          >
            Protect Your Family <ArrowForward />
          </button>
        </section>

        <section className="insurance-card">
          <div className="insurance-icon">
            <DirectionsCar fontSize="large" color="primary" />
          </div>
          <h2>Auto Insurance</h2>
          <p className="insurance-description">
            Drive with confidence knowing you're fully protected.
            Our auto insurance options cover everything from basic liability
            to comprehensive protection for your vehicle and loved ones.
          </p>
          <div className="coverage-list">
            <p><CheckCircle color="success" fontSize="small" /> Comprehensive Auto</p>
            <p><CheckCircle color="success" fontSize="small" /> Third Party Only</p>
            <p><CheckCircle color="success" fontSize="small" /> Premium Auto</p>
          </div>
          <button
            onClick={navigateToServices}
            className="cta-button"
          >
            Get Auto Coverage <ArrowForward />
          </button>
        </section>
      </div>

      <div className="home-footer">
        <p>Ready to find the perfect coverage? <span className="highlight">Get a free quote today!</span></p>
        <button
          onClick={navigateToServices}
          className="cta-button primary"
        >
          Get Started Now <ArrowForward />
        </button>
      </div>
    </div>
  );
}
