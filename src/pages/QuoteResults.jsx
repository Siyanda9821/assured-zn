import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './QuoteResults.css';

// API Configuration
const API_BASE_URL = 'https://688bd2e5cd9d22dda5cb646b.mockapi.io';

export function QuoteResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const formData = location.state?.formData || {};
  const quoteId = location.state?.quoteId;

  // ✅ Redirect in useEffect to avoid React warning
  useEffect(() => {
    if (!formData.subType) {
      navigate('/services');
    }
  }, [formData, navigate]);

  if (!formData.subType) {
    return null; // Avoid rendering during redirect
  }

  // Calculate pricing based on insurance type and form data
  const calculatePrice = () => {
    const { subType, insuranceType } = formData;

    // Base prices for different insurance types
    const basePrices = {
      'Travel Insurance': 25,
      'Gadget Insurance': 15,
      'Event Insurance': 50,
      'Term Life Insurance': 30,
      'Whole Life Insurance': 75,
      'Family Cover': 120,
      'Comprehensive Auto': 85,
      'Third Party Only': 45,
      'Premium Auto': 125
    };

    let basePrice = basePrices[subType] || 50;
    let multiplier = 1;
    let additionalFees = 0;

    // Calculate multipliers based on specific form data
    if (subType === 'Travel Insurance') {
      const travelers = parseInt(formData.travelersCount) || 1;
      const travelDays = formData.travelStartDate && formData.travelEndDate
        ? Math.ceil((new Date(formData.travelEndDate) - new Date(formData.travelStartDate)) / (1000 * 60 * 60 * 24))
        : 7;

      multiplier = travelers * Math.max(1, travelDays / 7);

      // International destinations cost more
      const destination = formData.destination?.toLowerCase() || '';
      if (destination.includes('europe') || destination.includes('asia') || destination.includes('australia')) {
        multiplier *= 1.5;
      }
    }

    else if (subType === 'Gadget Insurance') {
      const deviceValue = parseInt(formData.deviceValue) || 1000;
      multiplier = Math.max(1, deviceValue / 1000 * 0.02); // 2% of device value annually

      // Premium devices cost more to insure
      const brand = formData.deviceBrand?.toLowerCase() || '';
      if (brand.includes('apple') || brand.includes('samsung') || brand.includes('sony')) {
        multiplier *= 1.2;
      }
    }

    else if (subType === 'Event Insurance') {
      const guests = parseInt(formData.expectedGuests) || 50;
      const budget = parseInt(formData.eventBudget) || 5000;

      multiplier = Math.max(1, (guests / 100) * Math.sqrt(budget / 5000));

      // High-risk events
      const eventType = formData.eventType?.toLowerCase() || '';
      if (eventType.includes('concert') || eventType.includes('festival')) {
        multiplier *= 1.8;
      }
    }

    else if (insuranceType === 'life') {
      const coverage = parseInt(formData.coverageAmount) || 100000;
      const age = calculateAge(formData.dateOfBirth);

      // Base calculation: coverage amount / 1000 * age factor
      multiplier = (coverage / 100000) * Math.max(1, age / 30);

      // Smoking penalty
      if (formData.smokingStatus === 'current') {
        multiplier *= 2.5;
      } else if (formData.smokingStatus === 'former') {
        multiplier *= 1.3;
      }

      // Family cover additional members
      if (subType === 'Family Cover' && formData.familyMembers) {
        multiplier *= Math.max(1, parseInt(formData.familyMembers) * 0.7);
      }
    }

    else if (insuranceType === 'auto') {
      const vehicleYear = parseInt(formData.vehicleYear) || 2020;
      const currentYear = new Date().getFullYear();
      const vehicleAge = currentYear - vehicleYear;
      const mileage = parseInt(formData.annualMileage) || 12000;
      const experience = parseInt(formData.drivingExperience) || 5;

      // Newer cars and high mileage increase premium
      multiplier = Math.max(0.5, (15 - vehicleAge) / 10) * Math.max(1, mileage / 15000);

      // Experience discount
      if (experience >= 10) {
        multiplier *= 0.8;
      } else if (experience < 3) {
        multiplier *= 1.5;
      }

      // Luxury brands cost more
      const make = formData.vehicleMake?.toLowerCase() || '';
      if (make.includes('bmw') || make.includes('mercedes') || make.includes('audi') || make.includes('lexus')) {
        multiplier *= 1.4;
      }
    }

    // Administrative fee
    additionalFees = 15;

    const monthlyPrice = Math.round((basePrice * multiplier) * 100) / 100;
    const annualPrice = Math.round((monthlyPrice * 12 * 0.9) * 100) / 100; // 10% discount for annual
    const totalWithFees = Math.round((monthlyPrice + additionalFees) * 100) / 100;

    return {
      monthly: monthlyPrice,
      annual: annualPrice,
      fees: additionalFees,
      totalMonthly: totalWithFees
    };
  };

  // Helper function to calculate age
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 30;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const pricing = calculatePrice();

  // Submit policy to MockAPI
  const submitPolicyToAPI = async (policyData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(policyData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedPolicy = await response.json();
      console.log('Policy saved to API:', savedPolicy);
      return savedPolicy;

    } catch (error) {
      console.error('Error submitting policy:', error);
      throw error;
    }
  };

  // Format form data for display
  const formatFormData = () => {
    const sections = [];

    // Personal Information
    sections.push({
      title: "Personal Information",
      data: [
        { label: "Name", value: `${formData.firstName} ${formData.lastName}` },
        { label: "Email", value: formData.email },
        { label: "Phone", value: formData.phone },
        { label: "Date of Birth", value: new Date(formData.dateOfBirth).toLocaleDateString() }
      ]
    });

    // Insurance specific data
    if (formData.subType === 'Travel Insurance') {
      sections.push({
        title: "Travel Details",
        data: [
          { label: "Destination", value: formData.destination },
          { label: "Travel Period", value: `${new Date(formData.travelStartDate).toLocaleDateString()} - ${new Date(formData.travelEndDate).toLocaleDateString()}` },
          { label: "Number of Travelers", value: formData.travelersCount }
        ]
      });
    }

    if (formData.subType === 'Gadget Insurance') {
      sections.push({
        title: "Device Information",
        data: [
          { label: "Device", value: `${formData.deviceBrand} ${formData.deviceModel}` },
          { label: "Device Type", value: formData.deviceType },
          { label: "Purchase Date", value: new Date(formData.purchaseDate).toLocaleDateString() },
          { label: "Current Value", value: `$${parseInt(formData.deviceValue).toLocaleString()}` }
        ]
      });
    }

    if (formData.subType === 'Event Insurance') {
      sections.push({
        title: "Event Details",
        data: [
          { label: "Event Type", value: formData.eventType },
          { label: "Event Date", value: new Date(formData.eventDate).toLocaleDateString() },
          { label: "Location", value: formData.eventLocation },
          { label: "Expected Guests", value: formData.expectedGuests },
          { label: "Budget", value: `$${parseInt(formData.eventBudget).toLocaleString()}` }
        ]
      });
    }

    if (formData.insuranceType === 'life') {
      const lifeData = [
        { label: "Coverage Amount", value: `$${parseInt(formData.coverageAmount).toLocaleString()}` },
        { label: "Primary Beneficiary", value: formData.beneficiaryName },
        { label: "Relationship", value: formData.beneficiaryRelationship },
        { label: "Smoking Status", value: formData.smokingStatus === 'never' ? 'Non-smoker' : formData.smokingStatus === 'former' ? 'Former smoker' : 'Current smoker' }
      ];

      if (formData.familyMembers) {
        lifeData.push({ label: "Family Members", value: formData.familyMembers });
      }

      sections.push({
        title: "Life Insurance Details",
        data: lifeData
      });
    }

    if (formData.insuranceType === 'auto') {
      sections.push({
        title: "Vehicle Information",
        data: [
          { label: "Vehicle", value: `${formData.vehicleYear} ${formData.vehicleMake} ${formData.vehicleModel}` },
          { label: "VIN", value: formData.vehicleVin },
          { label: "Annual Mileage", value: `${parseInt(formData.annualMileage).toLocaleString()} miles` },
          { label: "Driving Experience", value: `${formData.drivingExperience} years` }
        ]
      });
    }

    return sections;
  };

  const sections = formatFormData();

  // Handle accepting the quote
  const handleAcceptQuote = async () => {
    setIsProcessing(true);

    try {
      // Create policy data to store
      const policyData = {
        type: formData.subType,
        category: formData.insuranceType,
        status: 'Active',
        monthlyPremium: pricing.totalMonthly,
        annualPremium: pricing.annual + pricing.fees * 12,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        customerInfo: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone
        },
        details: formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Submit to MockAPI
      const savedPolicy = await submitPolicyToAPI(policyData);

      // Also store in localStorage as backup
      const existingPolicies = JSON.parse(localStorage.getItem('userPolicies') || '[]');
      existingPolicies.push({ ...savedPolicy, id: savedPolicy.id });
      localStorage.setItem('userPolicies', JSON.stringify(existingPolicies));

      // Navigate to dashboard
      navigate('/dashboard', {
        state: {
          message: 'Policy created successfully!',
          newPolicy: savedPolicy
        }
      });

    } catch (error) {
      console.error('Failed to create policy:', error);
      alert('Failed to create policy. Please try again. 😞');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditQuote = () => {
    navigate(-1, { state: formData });
  };

  const handleBackToServices = () => {
    navigate('/services');
  };

  return (
    <div className="quote-results-page">
      <div className="quote-results-container">
        <div className="quote-results-header">
          <h1 className="quote-results-title">Your Insurance Quote</h1>
          <p className="quote-results-subtitle">
            Review your details and pricing for <strong>{formData.subType}</strong>
          </p>
        </div>

        <div className="quote-results-content">
          {/* Pricing Summary */}
          <div className="pricing-card">
            <div className="pricing-header">
              <h2>Pricing Summary</h2>
              <div className="insurance-type-badge">{formData.subType}</div>
            </div>

            <div className="pricing-details">
              <div className="price-row">
                <span>Monthly Premium:</span>
                <span className="price">${pricing.monthly}</span>
              </div>
              <div className="price-row">
                <span>Administrative Fee:</span>
                <span className="price">${pricing.fees}</span>
              </div>
              <div className="price-row total">
                <span>Total Monthly:</span>
                <span className="price">${pricing.totalMonthly}</span>
              </div>
              <div className="price-row annual">
                <span>Annual (10% discount):</span>
                <span className="price">${pricing.annual + pricing.fees * 12}</span>
              </div>
            </div>

            <div className="savings-highlight">
              <span>💰 Save ${Math.round((pricing.totalMonthly * 12) - (pricing.annual + pricing.fees * 12))} per year with annual billing!</span>
            </div>
          </div>

          {/* Quote Details */}
          <div className="quote-details">
            <h2>Quote Details</h2>

            {sections.map((section, index) => (
              <div key={index} className="detail-section">
                <h3>{section.title}</h3>
                <div className="detail-list">
                  {section.data.map((item, itemIndex) => (
                    <div key={itemIndex} className="detail-item">
                      <span className="detail-label">{item.label}:</span>
                      <span className="detail-value">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Coverage Information */}
          <div className="coverage-info">
            <h2>What's Covered</h2>
            <div className="coverage-list">
              {formData.subType === 'Travel Insurance' && (
                <>
                  <div className="coverage-item">✅ Trip Cancellation/Interruption</div>
                  <div className="coverage-item">✅ Medical Emergency Coverage</div>
                  <div className="coverage-item">✅ Lost/Stolen Baggage</div>
                  <div className="coverage-item">✅ Flight Delays</div>
                </>
              )}

              {formData.subType === 'Gadget Insurance' && (
                <>
                  <div className="coverage-item">✅ Accidental Damage</div>
                  <div className="coverage-item">✅ Theft Protection</div>
                  <div className="coverage-item">✅ Liquid Damage</div>
                  <div className="coverage-item">✅ Worldwide Coverage</div>
                </>
              )}

              {formData.subType === 'Event Insurance' && (
                <>
                  <div className="coverage-item">✅ Event Cancellation</div>
                  <div className="coverage-item">✅ Vendor No-Show</div>
                  <div className="coverage-item">✅ Weather Protection</div>
                  <div className="coverage-item">✅ Liability Coverage</div>
                </>
              )}

              {formData.insuranceType === 'life' && (
                <>
                  <div className="coverage-item">✅ Death Benefit</div>
                  <div className="coverage-item">✅ Accidental Death</div>
                  <div className="coverage-item">✅ Terminal Illness</div>
                  <div className="coverage-item">✅ Premium Waiver</div>
                </>
              )}

              {formData.insuranceType === 'auto' && (
                <>
                  <div className="coverage-item">✅ Collision Coverage</div>
                  <div className="coverage-item">✅ Comprehensive Coverage</div>
                  <div className="coverage-item">✅ Liability Protection</div>
                  <div className="coverage-item">✅ Roadside Assistance</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="quote-actions">
          <button
            onClick={handleBackToServices}
            className="btn-secondary"
          >
            Back to Services
          </button>

          <button
            onClick={handleEditQuote}
            className="btn-outline"
          >
            Edit Quote
          </button>

          <button
            onClick={handleAcceptQuote}
            className="btn-primary"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="loading-spinner"></span>
                Processing...
              </>
            ) : (
              <>
                Accept Quote & Buy Policy 🎉
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
