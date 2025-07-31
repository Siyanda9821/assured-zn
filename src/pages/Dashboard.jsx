import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import {
  Flight,
  Smartphone,
  Celebration,
  FamilyRestroom,
  DirectionsCar,
  Shield,

  CheckCircle,
  Description,
  CreditCard,
  SupportAgent,
  Assessment,
  Add,
  Close,
  ConfirmationNumber
} from '@mui/icons-material';

const API_BASE_URL = 'https://688bd2e5cd9d22dda5cb646b.mockapi.io';

export function Dashboard() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('Policy created successfully!');
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const loadPoliciesFromAPI = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/policies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiPolicies = await response.json();
      console.log('Loaded policies from API:', apiPolicies);

      localStorage.setItem('userPolicies', JSON.stringify(apiPolicies));
      setPolicies(apiPolicies);

    } catch (err) {
      console.error('Error loading policies from API:', err);
      setError('Failed to load policies from server');

      const localPolicies = JSON.parse(localStorage.getItem('userPolicies') || '[]');
      setPolicies(localPolicies);
    } finally {
      setLoading(false);
    }
  };

  const deletePolicyFromAPI = async (policyId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/policies/${policyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting policy from API:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadPoliciesFromAPI();

    if (location.state?.message) {
      setMessage(location.state.message);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 5000);
    }
  }, [location.state]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'status-active';
      case 'Pending': return 'status-pending';
      case 'Expired': return 'status-expired';
      default: return 'status-default';
    }
  };

  const getInsuranceIcon = (type) => {
    switch (type) {
      case 'Travel Insurance': return <Flight fontSize="inherit" />;
      case 'Gadget Insurance': return <Smartphone fontSize="inherit" />;
      case 'Event Insurance': return <Celebration fontSize="inherit" />;
      case 'Term Life Insurance':
      case 'Whole Life Insurance':
      case 'Family Cover': return <FamilyRestroom fontSize="inherit" />;
      case 'Comprehensive Auto':
      case 'Third Party Only':
      case 'Premium Auto': return <DirectionsCar fontSize="inherit" />;
      default: return <Shield fontSize="inherit" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const timeDiff = end.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff > 0 ? daysDiff : 0;
  };

  const handleGetNewQuote = () => {
    navigate('/services');
  };

  const handleEditPolicy = (policy) => {
    navigate('/quote-form', {
      state: {
        ...policy.details,
        editing: true,
        policyId: policy.id,
        originalPolicy: policy
      }
    });
  };

  const handleCancelPolicy = async (policy) => {
    if (window.confirm(`Are you sure you want to cancel your ${policy.type} policy? This action cannot be undone.`)) {
      try {
        await deletePolicyFromAPI(policy.id);

        const updatedPolicies = policies.filter(p => p.id !== policy.id);
        setPolicies(updatedPolicies);

        localStorage.setItem('userPolicies', JSON.stringify(updatedPolicies));

        setMessage(`${policy.type} policy has been cancelled successfully.`);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 5000);

      } catch (error) {
        console.error('Failed to cancel policy:', error);
        alert('Failed to cancel policy. Please try again.');
      }
    }
  };

  const handleViewPolicy = (policy) => {
    setSelectedPolicy(policy);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPolicy(null);
  };

  const PolicyModal = () => {
    if (!selectedPolicy) return null;

    const policy = selectedPolicy;
    const details = policy.details;

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title-section">
              <span className="modal-icon">{getInsuranceIcon(policy.type)}</span>
              <div>
                <h2 className="modal-title">{policy.type}</h2>
                <p className="modal-subtitle">Policy #{policy.id}</p>
              </div>
            </div>
            <button className="modal-close" onClick={closeModal}>
              <Close fontSize="small" />
            </button>
          </div>

          <div className="modal-body">
            <div className="modal-section">
              <h3 className="section-title">Policy Overview</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className={`info-value ${getStatusColor(policy.status)}`}>
                    {policy.status}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Monthly Premium:</span>
                  <span className="info-value price">${policy.monthlyPremium}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Annual Premium:</span>
                  <span className="info-value price">${policy.annualPremium}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Coverage Period:</span>
                  <span className="info-value">
                    {formatDate(policy.startDate)} - {formatDate(policy.endDate)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Days Remaining:</span>
                  <span className="info-value days-remaining-value">
                    {calculateDaysRemaining(policy.endDate)} days
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-section">
              <h3 className="section-title">Policy Holder Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{policy.customerInfo.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{policy.customerInfo.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{policy.customerInfo.phone}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Date of Birth:</span>
                  <span className="info-value">
                    {details.dateOfBirth ? formatDate(details.dateOfBirth) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {policy.type === 'Travel Insurance' && (
              <div className="modal-section">
                <h3 className="section-title">Travel Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Destination:</span>
                    <span className="info-value">{details.destination || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Number of Travelers:</span>
                    <span className="info-value">{details.travelersCount || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Travel Start Date:</span>
                    <span className="info-value">
                      {details.travelStartDate ? formatDate(details.travelStartDate) : 'N/A'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Travel End Date:</span>
                    <span className="info-value">
                      {details.travelEndDate ? formatDate(details.travelEndDate) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {policy.type === 'Gadget Insurance' && (
              <div className="modal-section">
                <h3 className="section-title">Device Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Device Type:</span>
                    <span className="info-value">{details.deviceType || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Brand:</span>
                    <span className="info-value">{details.deviceBrand || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Model:</span>
                    <span className="info-value">{details.deviceModel || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Purchase Date:</span>
                    <span className="info-value">
                      {details.purchaseDate ? formatDate(details.purchaseDate) : 'N/A'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Device Value:</span>
                    <span className="info-value price">
                      ${details.deviceValue ? parseInt(details.deviceValue).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {policy.type === 'Event Insurance' && (
              <div className="modal-section">
                <h3 className="section-title">Event Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Event Type:</span>
                    <span className="info-value">{details.eventType || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Event Date:</span>
                    <span className="info-value">
                      {details.eventDate ? formatDate(details.eventDate) : 'N/A'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Location:</span>
                    <span className="info-value">{details.eventLocation || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Expected Guests:</span>
                    <span className="info-value">{details.expectedGuests || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Event Budget:</span>
                    <span className="info-value price">
                      ${details.eventBudget ? parseInt(details.eventBudget).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {policy.category === 'life' && (
              <div className="modal-section">
                <h3 className="section-title">Life Insurance Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Coverage Amount:</span>
                    <span className="info-value price">
                      ${details.coverageAmount ? parseInt(details.coverageAmount).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Primary Beneficiary:</span>
                    <span className="info-value">{details.beneficiaryName || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Relationship:</span>
                    <span className="info-value">{details.beneficiaryRelationship || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Smoking Status:</span>
                    <span className="info-value">
                      {details.smokingStatus === 'never' ? 'Non-smoker' :
                       details.smokingStatus === 'former' ? 'Former smoker' :
                       details.smokingStatus === 'current' ? 'Current smoker' : 'N/A'}
                    </span>
                  </div>
                  {details.familyMembers && (
                    <div className="info-item">
                      <span className="info-label">Family Members:</span>
                      <span className="info-value">{details.familyMembers}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {policy.category === 'auto' && (
              <div className="modal-section">
                <h3 className="section-title">Vehicle Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Vehicle:</span>
                    <span className="info-value">
                      {details.vehicleYear || 'N/A'} {details.vehicleMake || 'N/A'} {details.vehicleModel || 'N/A'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">VIN:</span>
                    <span className="info-value">{details.vehicleVin || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Annual Mileage:</span>
                    <span className="info-value">
                      {details.annualMileage ? `${parseInt(details.annualMileage).toLocaleString()} miles` : 'N/A'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Driving Experience:</span>
                    <span className="info-value">
                      {details.drivingExperience ? `${details.drivingExperience} years` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-section">
              <h3 className="section-title">What's Covered</h3>
              <div className="coverage-list">
                {policy.type === 'Travel Insurance' && (
                  <>
                    <div className="coverage-item">
                      <CheckCircle fontSize="small" color="success" /> Trip Cancellation/Interruption
                    </div>
                    <div className="coverage-item">
                      <CheckCircle fontSize="small" color="success" /> Medical Emergency Coverage
                    </div>
                    <div className="coverage-item">
                      <CheckCircle fontSize="small" color="success" /> Lost/Stolen Baggage
                    </div>
                    <div className="coverage-item">
                      <CheckCircle fontSize="small" color="success" /> Flight Delays
                    </div>
                  </>
                )}

                {policy.type === 'Gadget Insurance' && (
                  <>
                    <div className="coverage-item">
                      <CheckCircle fontSize="small" color="success" /> Accidental Damage
                    </div>
                    <div className="coverage-item">
                      <CheckCircle fontSize="small" color="success" /> Theft Protection
                    </div>
                    <div className="coverage-item">
                      <CheckCircle fontSize="small" color="success" /> Liquid Damage
                    </div>
                    <div className="coverage-item">
                      <CheckCircle fontSize="small" color="success" /> Worldwide Coverage
                    </div>
                  </>
                )}

                {policy.type === 'Event Insurance' && (
                  <>
                    <div className="coverage-item">
                      <CheckCircle fontSize="small" color="success" /> Event Cancellation
                    </div>
                    <div className="coverage-item">
                      <CheckCircle fontSize="small" color="success" /> Vendor No-Show
                    </div>
                    <div className="coverage-item">
                      <CheckCircle fontSize="small" color="success" /> Weather Protection
                    </div>
                    <div className="coverage-item">
                      <CheckCircle fontSize="small" color="success" /> Liability Coverage
                    </div>
                  </>
                )}

                {policy.category === 'life' && (
                  <>
                    <div className="coverage-item">
                      <CheckCircle fontSize="small" color="success" /> Death Benefit
                    </div>
                    <div className="coverage-item">
                      <CheckCircle fontSize="small" color="success" /> Accidental Death
                    </div>
                    <div className="coverage-item">
                      <CheckCircle fontSize="small" color="success" /> Terminal Illness
                    </div>
                    <div className="coverage-item">
                      <CheckCircle fontSize="small" color="success" /> Premium Waiver
                    </div>
                  </>
                )}

                {policy.category === 'auto' && (
                  <>
                    <div className="coverage-item">
                      <CheckCircle fontSize="small" color="success" /> Collision Coverage
                    </div>
                    <div className="coverage-item">
                      <CheckCircle fontSize="small" color="success" /> Comprehensive Coverage
                    </div>
                    <div className="coverage-item">
                      <CheckCircle fontSize="small" color="success" /> Liability Protection
                    </div>
                    <div className="coverage-item">
                      <CheckCircle fontSize="small" color="success" /> Roadside Assistance
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button onClick={closeModal} className="btn-secondary-modal">
              Close
            </button>
            <button
              onClick={() => {
                closeModal();
                handleEditPolicy(policy);
              }}
              className="btn-primary-modal"
            >
              Edit Policy
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <h1 className="loading-text">Loading your policies...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="error-container">
            <div className="error-content">
              <h1 className="error-title">Error Loading Policies</h1>
              <p className="error-message">{error}</p>
              <button
                onClick={() => loadPoliciesFromAPI()}
                className="btn-primary"
              >
                Retry Loading
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (policies.length === 0) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="empty-state">
            <div className="empty-icon">
              <Shield fontSize="large" />
            </div>
            <h1 className="empty-title">
              Welcome to Your Insurance Dashboard
            </h1>
            <p className="empty-description">
              You don't have any insurance policies yet. Get started by getting your first quote!
            </p>
            <button
              onClick={handleGetNewQuote}
              className="btn-primary-large"
            >
              <Add /> Get Your First Quote
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {showMessage && (
          <div className="success-message">
            <div className="success-content">
              <div className="success-icon">
                <ConfirmationNumber fontSize="small" />
              </div>
              <span className="success-text">{message}</span>
            </div>
            <button
              onClick={() => setShowMessage(false)}
              className="close-btn"
            >
              <Close fontSize="small" />
            </button>
          </div>
        )}

        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="dashboard-title">
                Insurance Dashboard
              </h1>
              <p className="dashboard-subtitle">
                Manage your {policies.length} insurance {policies.length === 1 ? 'policy' : 'policies'}
              </p>
            </div>
            <button
              onClick={handleGetNewQuote}
              className="btn-primary new-quote-btn"
            >
              <Add /> New Quote
            </button>
          </div>
        </div>

        <div className="quick-actions">
          <button className="quick-action-item">
            <div className="quick-action-icon">
              <Description fontSize="small" />
            </div>
            <div className="quick-action-text">View Documents</div>
          </button>
          <button className="quick-action-item">
            <div className="quick-action-icon">
              <CreditCard fontSize="small" />
            </div>
            <div className="quick-action-text">Payment Methods</div>
          </button>
          <button className="quick-action-item">
            <div className="quick-action-icon">
              <SupportAgent fontSize="small" />
            </div>
            <div className="quick-action-text">Contact Support</div>
          </button>
          <button className="quick-action-item">
            <div className="quick-action-icon">
              <Assessment fontSize="small" />
            </div>
            <div className="quick-action-text">Claims History</div>
          </button>
        </div>

        <div className="policies-grid">
          {policies.map((policy) => (
            <div key={policy.id} className="policy-card">
              <div className="policy-header">
                <div className="policy-header-content">
                  <span className="policy-icon">{getInsuranceIcon(policy.type)}</span>
                  <span className={`policy-status ${getStatusColor(policy.status)}`}>
                    {policy.status}
                  </span>
                </div>
                <h3 className="policy-title">{policy.type}</h3>
                <p className="policy-id">Policy #{policy.id}</p>
              </div>

              <div className="policy-body">
                <div className="policy-details">
                  <div className="detail-row">
                    <span className="detail-label">Monthly Premium:</span>
                    <span className="detail-value monthly-price">${policy.monthlyPremium}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Annual Premium:</span>
                    <span className="detail-value annual-price">${policy.annualPremium}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Start Date:</span>
                    <span className="detail-value">{formatDate(policy.startDate)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">End Date:</span>
                    <span className="detail-value">{formatDate(policy.endDate)}</span>
                  </div>
                </div>

                <div className="days-remaining">
                  <div className="days-number">
                    {calculateDaysRemaining(policy.endDate)}
                  </div>
                  <div className="days-label">days remaining</div>
                </div>

                <div className="customer-info">
                  <h4 className="customer-title">Policy Holder</h4>
                  <p className="customer-name">{policy.customerInfo.name}</p>
                  <p className="customer-email">{policy.customerInfo.email}</p>
                </div>

                <div className="policy-actions">
                  <button
                    onClick={() => handleViewPolicy(policy)}
                    className="btn-view-details"
                  >
                    View Details
                  </button>
                  <div className="policy-action-buttons">
                    <button
                      onClick={() => handleEditPolicy(policy)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleCancelPolicy(policy)}
                      className="btn-cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="summary-stats">
          <h2 className="summary-title">Coverage Summary</h2>
          <div className="stats-grid">
            <div className="stat-item stat-blue">
              <div className="stat-number">
                {policies.length}
              </div>
              <div className="stat-label">Active Policies</div>
            </div>
            <div className="stat-item stat-green">
              <div className="stat-number">
                ${policies.reduce((sum, policy) => sum + policy.monthlyPremium, 0).toFixed(2)}
              </div>
              <div className="stat-label">Monthly Total</div>
            </div>
            <div className="stat-item stat-purple">
              <div className="stat-number">
                ${policies.reduce((sum, policy) => sum + policy.annualPremium, 0).toFixed(2)}
              </div>
              <div className="stat-label">Annual Total</div>
            </div>
            <div className="stat-item stat-orange">
              <div className="stat-number">
                ${(policies.reduce((sum, policy) => sum + policy.monthlyPremium, 0) * 12 - policies.reduce((sum, policy) => sum + policy.annualPremium, 0)).toFixed(2)}
              </div>
              <div className="stat-label">Annual Savings</div>
            </div>
          </div>
        </div>

        {policies.length > 0 && (
          <div className="recent-activity">
            <h2 className="activity-title">Recent Activity</h2>
            <div className="activity-list">
              {policies.slice(0, 3).map((policy, index) => (
                <div key={policy.id} className="activity-item">
                  <div className="activity-icon">
                    <CheckCircle fontSize="small" color="success" />
                  </div>
                  <div className="activity-content">
                    <div className="activity-main">Policy Activated</div>
                    <div className="activity-sub">{policy.type} policy has been activated</div>
                  </div>
                  <div className="activity-time">
                    {index === 0 ? 'Just now' : `${index} ${index === 1 ? 'day' : 'days'} ago`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showModal && <PolicyModal />}
      </div>
    </div>
  );
}
