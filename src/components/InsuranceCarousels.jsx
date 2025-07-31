import { useState, useEffect } from 'react';
import { CarouselSection } from './CarouselSection';
import './InsuranceCarousels.css';

import HomeIcon from '@mui/icons-material/Home';
import FlightIcon from '@mui/icons-material/Flight';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SecurityIcon from '@mui/icons-material/Security';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import GroupIcon from '@mui/icons-material/Group';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import UmbrellaIcon from '@mui/icons-material/Umbrella';

const API_BASE_URL = 'https://688bdb51cd9d22dda5cb8126.mockapi.io';

const iconMap = {
  'home': HomeIcon,
  'plane': FlightIcon,
  'flight': FlightIcon,
  'heart': FavoriteIcon,
  'shield': SecurityIcon,
  'security': SecurityIcon,
  'users': GroupIcon,
  'group': GroupIcon,
  'dollar': AttachMoneyIcon,
  'money': AttachMoneyIcon,
  'clock': AccessTimeIcon,
  'time': AccessTimeIcon,
  'car': DirectionsCarIcon,
  'health': HealthAndSafetyIcon,
  'umbrella': UmbrellaIcon,
  'default': SecurityIcon
};

export function InsuranceCarousels() {
  const [shortTermData, setShortTermData] = useState([]);
  const [lifeInsuranceData, setLifeInsuranceData] = useState([]);
  const [autoInsuranceData, setAutoInsuranceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function getInsuranceData() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/insurance-products`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const allProducts = await response.json();
      console.log('Fetched insurance products:', allProducts);

      const processData = (data) => {
        return data.map(item => ({
          ...item,
          icon: iconMap[item.iconName] || iconMap.default
        }));
      };

      const shortTerm = allProducts.filter(product => product.category === 'short-term');
      const life = allProducts.filter(product => product.category === 'life');
      const auto = allProducts.filter(product => product.category === 'auto');

      setShortTermData(processData(shortTerm));
      setLifeInsuranceData(processData(life));
      setAutoInsuranceData(processData(auto));

      setLoading(false);

    } catch (err) {
      setError(`Failed to load insurance data: ${err.message}`);
      console.error('Error fetching insurance data:', err);
      setLoading(false);
    }
  }

  useEffect(() => {
    getInsuranceData();
  }, []);

  if (loading) {
    return (
      <div className="insurance-carousels__loading-container">
        <div className="insurance-carousels__loading-spinner"></div>
        <h1 className="insurance-carousels__loading">Loading insurance options...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="insurance-carousels__error-container">
        <div className="insurance-carousels__error-content">
          <div className="insurance-carousels__error-box">
            <h3 className="insurance-carousels__error-title">Error Loading Data</h3>
            <p className="insurance-carousels__error-message">{error}</p>
            <div className="insurance-carousels__error-actions">
              <button
                onClick={() => getInsuranceData()}
                className="insurance-carousels__retry-btn"
              >
                Retry
              </button>
              <button
                onClick={() => window.location.reload()}
                className="insurance-carousels__refresh-btn"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="insurance-carousels">
      <div className="insurance-carousels__container">
        <CarouselSection
          title="Short-Term Insurance"
          subtitle="Flexible protection for immediate needs"
          data={shortTermData}
          color="bg-blue-600"
          insuranceType="short-term"
        />

        <CarouselSection
          title="Life Insurance"
          subtitle="Secure your family's financial future"
          data={lifeInsuranceData}
          color="bg-green-600"
          insuranceType="life"
        />

        <CarouselSection
          title="Auto Insurance"
          subtitle="Complete protection for your vehicle"
          data={autoInsuranceData}
          color="bg-purple-600"
          insuranceType="auto"
        />
      </div>
    </div>
  );
}
