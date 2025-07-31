import { InsuranceCarousels } from '../components/InsuranceCarousels';
import './Services.css';
import Paper from '@mui/material/Paper';

export function Services() {
  return (
     <Paper sx={{ bgcolor: 'background.paper', p: 3 }}>
    <div className="services-page">
      <div className="services-header">
        <div className="services-header__container">
          <h1 className="services-header__title">
            Our Insurance Services
          </h1>
          <p className="services-header__subtitle">
            Comprehensive protection tailored to your needs. From short-term coverage
            to life insurance and auto protection, we've got you covered.
          </p>
        </div>
      </div>

      <InsuranceCarousels />

      <div className="services-info">
        <div className="services-info__container">
          <h2 className="services-info__title">
            Why Choose Our Insurance Services?
          </h2>
          <div className="services-info__grid">
            <div className="services-info__card">
              <h3 className="services-info__card-title">
                24/7 Support
              </h3>
              <p className="services-info__card-text">
                Our dedicated team is available around the clock to assist with
                claims and questions.
              </p>
            </div>
            <div className="services-info__card">
              <h3 className="services-info__card-title">
                Competitive Rates
              </h3>
              <p className="services-info__card-text">
                Get the best coverage at prices that fit your budget with our
                competitive insurance rates.
              </p>
            </div>
            <div className="services-info__card">
              <h3 className="services-info__card-title">
                Quick Claims
              </h3>
              <p className="services-info__card-text">
                Fast and efficient claims processing to get you back on track
                when you need it most.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Paper>
  );
}
