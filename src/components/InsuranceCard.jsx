// src/components/carousels/InsuranceCard.jsx
import { useNavigate } from "react-router";
import IconButton from "@mui/material/IconButton";
// import EditIcon from "@mui/icons-material/Edit";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import './InsuranceCard.css';

export function InsuranceCard({ item, color, isCenter = false, insuranceType }) {
  const IconComponent = item.icon;
  const navigate = useNavigate();

  const handleGetQuote = () => {
    console.log(`Getting quote for: ${item.title}`, item.id);

    // Navigate with state containing pre-fill data
    navigate('/quote-form', {
      state: {
        insuranceType: insuranceType,
        subType: item.title,
        itemId: item.id,
        price: item.price,
        description: item.description,
        features: item.features
      }
    });
  };

  const handleEditInsurance = () => {
    console.log(`Editing insurance: ${item.title}`, item.id);
    navigate(`/insurance/${item.id}/edit`);
  };

  return (
    <div className={`insurance-card ${isCenter ? 'insurance-card--center' : ''}`}>
      {/* Card Header */}
      <div className="insurance-card__header">
        <div className={`insurance-card__icon ${color}`}>
          <IconComponent className="insurance-card__icon-svg" />
        </div>
        <div className="insurance-card__content">
          <h3 className="insurance-card__title">
            {item.title}
          </h3>
          <div className="insurance-card__price-container">
            <span className="insurance-card__price-label">from</span>
            <span className="insurance-card__price">
              {item.price.replace('from ', '')}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="insurance-card__description">
        {item.description}
      </p>

      {/* Features List */}
      <div className="insurance-card__features">
        <h4 className="insurance-card__features-title">
          Key Features:
        </h4>
        <ul className="insurance-card__features-list">
          {item.features.map((feature, index) => (
            <li key={index} className={`insurance-card__feature ${
              feature.startsWith('*') ? 'insurance-card__feature--disclaimer' : ''
            }`}>
              {!feature.startsWith('*') && (
                <div className="insurance-card__feature-bullet"></div>
              )}
              <span className={feature.startsWith('*') ? 'insurance-card__feature-text--disclaimer' : 'insurance-card__feature-text'}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="insurance-card__actions">
        <button
          onClick={handleGetQuote}
          className={`insurance-card__quote-btn ${color}`}
        >
          <RequestQuoteIcon className="insurance-card__quote-icon" />
          Get Quote
        </button>

        <IconButton
          color="secondary"
          onClick={handleEditInsurance}
          aria-label={`Edit ${item.title} insurance`}
          className="insurance-card__edit-btn"
        >
          {/* <EditIcon /> */}
        </IconButton>
      </div>
    </div>
  );
}
