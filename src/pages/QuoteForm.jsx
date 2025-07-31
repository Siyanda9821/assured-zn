import { useLocation, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { object, string, date, number } from 'yup';
import { useState } from 'react';
import './QuoteForm.css';

const API_BASE_URL = 'https://688bd2e5cd9d22dda5cb646b.mockapi.io';

const createValidationSchema = (insuranceType, subType) => {
  const baseSchema = {
    insuranceType: string()
      .required("Please select an insurance type 📋")
      .oneOf(['short-term', 'life', 'auto'], 'Invalid insurance type'),

    subType: string()
      .required("Please select a specific insurance product 🎯")
      .min(3, "Invalid insurance product"),

    firstName: string()
      .required("First name is required 👤")
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be less than 50 characters")
      .matches(/^[A-Za-z\s]+$/, "First name can only contain letters"),

    lastName: string()
      .required("Last name is required 👤")
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be less than 50 characters")
      .matches(/^[A-Za-z\s]+$/, "Last name can only contain letters"),

    email: string()
      .required("Email address is required 📧")
      .email("Please enter a valid email address")
      .min(5, "Email must be at least 5 characters"),

    // Fixed phone regex - removed unnecessary escapes
    phone: string()
      .required("Phone number is required 📱")
      .matches(/^[+]?[0-9\s\-()]{10,15}$/, "Please enter a valid phone number")
      .min(10, "Phone number must be at least 10 digits"),

    dateOfBirth: date()
      .required("Date of birth is required 📅")
      .max(new Date(), "Date of birth cannot be in the future")
      .test('age', 'You must be at least 18 years old', function(value) {
        if (!value) return false;
        const today = new Date();
        const birthDate = new Date(value);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          return age - 1 >= 18;
        }
        return age >= 18;
      })
};

  if (subType === 'Travel Insurance') {
    baseSchema.destination = string().required("Destination is required ✈️");
    baseSchema.travelStartDate = date()
      .required("Travel start date is required 📅")
      .min(new Date(), "Travel date must be in the future");
    baseSchema.travelEndDate = date()
      .required("Travel end date is required 📅")
      .test('end-after-start', 'End date must be after start date', function(value) {
        const { travelStartDate } = this.parent;
        return !travelStartDate || !value || new Date(value) > new Date(travelStartDate);
      });
    baseSchema.travelersCount = number()
      .required("Number of travelers is required 👥")
      .min(1, "At least 1 traveler required")
      .max(20, "Maximum 20 travelers allowed");
  }

  if (subType === 'Gadget Insurance') {
    baseSchema.deviceType = string().required("Device type is required 📱");
    baseSchema.deviceBrand = string().required("Device brand is required 🏷️");
    baseSchema.deviceModel = string().required("Device model is required 📋");
    baseSchema.purchaseDate = date()
      .required("Purchase date is required 📅")
      .max(new Date(), "Purchase date cannot be in the future");
    baseSchema.deviceValue = number()
      .required("Device value is required 💰")
      .min(100, "Minimum device value is $100")
      .max(50000, "Maximum device value is $50,000");
  }

  if (subType === 'Event Insurance') {
    baseSchema.eventType = string().required("Event type is required 🎉");
    baseSchema.eventDate = date()
      .required("Event date is required 📅")
      .min(new Date(), "Event date must be in the future");
    baseSchema.eventLocation = string().required("Event location is required 📍");
    baseSchema.expectedGuests = number()
      .required("Expected guests is required 👥")
      .min(1, "At least 1 guest expected")
      .max(10000, "Maximum 10,000 guests allowed");
    baseSchema.eventBudget = number()
      .required("Event budget is required 💰")
      .min(500, "Minimum event budget is $500");
  }

  if (insuranceType === 'life') {
    baseSchema.coverageAmount = number()
      .required("Coverage amount is required 💰")
      .min(10000, "Minimum coverage is $10,000")
      .max(5000000, "Maximum coverage is $5,000,000");
    baseSchema.beneficiaryName = string()
      .required("Beneficiary name is required 👤")
      .min(2, "Beneficiary name must be at least 2 characters");
    baseSchema.beneficiaryRelationship = string()
      .required("Beneficiary relationship is required 👪");
    baseSchema.smokingStatus = string()
      .required("Smoking status is required 🚭")
      .oneOf(['never', 'former', 'current'], 'Invalid smoking status');

    if (subType === 'Family Cover') {
      baseSchema.familyMembers = number()
        .required("Number of family members is required 👨‍👩‍👧‍👦")
        .min(2, "Family cover requires at least 2 members")
        .max(10, "Maximum 10 family members allowed");
    }
  }

  if (insuranceType === 'auto') {
    baseSchema.vehicleMake = string().required("Vehicle make is required 🚗");
    baseSchema.vehicleModel = string().required("Vehicle model is required 🚙");
    baseSchema.vehicleYear = number()
      .required("Vehicle year is required 📅")
      .min(1990, "Vehicle must be 1990 or newer")
      .max(new Date().getFullYear() + 1, "Invalid vehicle year");
    baseSchema.vehicleVin = string()
      .required("Vehicle VIN is required 🔢")
      .matches(/^[A-HJ-NPR-Z0-9]{17}$/, "Please enter a valid 17-character VIN");
    baseSchema.annualMileage = number()
      .required("Annual mileage is required 📏")
      .min(1000, "Minimum annual mileage is 1,000 miles")
      .max(100000, "Maximum annual mileage is 100,000 miles");
    baseSchema.drivingExperience = number()
      .required("Years of driving experience is required 🚗")
      .min(0, "Driving experience cannot be negative")
      .max(70, "Maximum driving experience is 70 years");
  }

  return object(baseSchema);
};

export function QuoteForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const preFilledData = location.state || {};

  const insuranceOptions = {
    'short-term': [
      'Travel Insurance',
      'Gadget Insurance',
      'Event Insurance'
    ],
    'life': [
      'Term Life Insurance',
      'Whole Life Insurance',
      'Family Cover'
    ],
    'auto': [
      'Comprehensive Auto',
      'Third Party Only',
      'Premium Auto'
    ]
  };

  const getInitialValues = () => {
    const base = {
      insuranceType: preFilledData.insuranceType || '',
      subType: preFilledData.subType || '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
    };

    const subType = preFilledData.subType;

    if (subType === 'Travel Insurance') {
      return { ...base, destination: '', travelStartDate: '', travelEndDate: '', travelersCount: '' };
    }
    if (subType === 'Gadget Insurance') {
      return { ...base, deviceType: '', deviceBrand: '', deviceModel: '', purchaseDate: '', deviceValue: '' };
    }
    if (subType === 'Event Insurance') {
      return { ...base, eventType: '', eventDate: '', eventLocation: '', expectedGuests: '', eventBudget: '' };
    }
    if (preFilledData.insuranceType === 'life') {
      const lifeBase = { ...base, coverageAmount: '', beneficiaryName: '', beneficiaryRelationship: '', smokingStatus: '' };
      if (subType === 'Family Cover') {
        return { ...lifeBase, familyMembers: '' };
      }
      return lifeBase;
    }
    if (preFilledData.insuranceType === 'auto') {
      return { ...base, vehicleMake: '', vehicleModel: '', vehicleYear: '', vehicleVin: '', annualMileage: '', drivingExperience: '' };
    }

    return base;
  };

  const submitQuoteToAPI = async (formData) => {
    try {
      const quoteData = {
        ...formData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedQuote = await response.json();
      console.log('Quote saved to API:', savedQuote);
      return savedQuote;

    } catch (error) {
      console.error('Error submitting quote:', error);
      throw error;
    }
  };

  const formik = useFormik({
    initialValues: getInitialValues(),

    validationSchema: createValidationSchema(preFilledData.insuranceType, preFilledData.subType),

    onSubmit: async (values) => {
      setIsSubmitting(true);

      try {
        console.log('Quote form submitted:', values);

        await submitQuoteToAPI(values);

        navigate('/QuoteResults', {
          state: {
            formData: values,
            quoteId: Date.now()
          }
        });

      } catch (error) {
        console.error('Failed to submit quote:', error);
        alert('Failed to submit quote. Please try again. 😞');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const {
    handleSubmit,
    handleChange,
    handleBlur,
    values,
    errors,
    touched,
    setFieldValue
  } = formik;

  const handleInsuranceTypeChange = (e) => {
    const newType = e.target.value;
    setFieldValue('insuranceType', newType);
    setFieldValue('subType', '');
  };

  const goBack = () => {
    navigate(-1);
  };

  const renderDynamicFields = () => {
    if (!values.subType) return null;

    if (values.subType === 'Travel Insurance') {
      return (
        <div className="dynamic-fields">
          <h3 className="section-title">Travel Details 🌍</h3>

          <div className="form-group">
            <label htmlFor="destination" className="form-label">Destination *</label>
            <input
              type="text"
              id="destination"
              name="destination"
              placeholder="Where are you traveling to?"
              value={values.destination}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${touched.destination && errors.destination ? 'form-error' : ''}`}
            />
            {touched.destination && errors.destination && (
              <div className="error-message">{errors.destination}</div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="travelStartDate" className="form-label">Travel Start Date *</label>
              <input
                type="date"
                id="travelStartDate"
                name="travelStartDate"
                value={values.travelStartDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${touched.travelStartDate && errors.travelStartDate ? 'form-error' : ''}`}
              />
              {touched.travelStartDate && errors.travelStartDate && (
                <div className="error-message">{errors.travelStartDate}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="travelEndDate" className="form-label">Travel End Date *</label>
              <input
                type="date"
                id="travelEndDate"
                name="travelEndDate"
                value={values.travelEndDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${touched.travelEndDate && errors.travelEndDate ? 'form-error' : ''}`}
              />
              {touched.travelEndDate && errors.travelEndDate && (
                <div className="error-message">{errors.travelEndDate}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="travelersCount" className="form-label">Number of Travelers *</label>
            <input
              type="number"
              id="travelersCount"
              name="travelersCount"
              placeholder="How many people are traveling?"
              min="1"
              max="20"
              value={values.travelersCount}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${touched.travelersCount && errors.travelersCount ? 'form-error' : ''}`}
            />
            {touched.travelersCount && errors.travelersCount && (
              <div className="error-message">{errors.travelersCount}</div>
            )}
          </div>
        </div>
      );
    }

    if (values.subType === 'Gadget Insurance') {
      return (
        <div className="dynamic-fields">
          <h3 className="section-title">Device Information 📱</h3>

          <div className="form-group">
            <label htmlFor="deviceType" className="form-label">Device Type *</label>
            <select
              id="deviceType"
              name="deviceType"
              value={values.deviceType}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-select ${touched.deviceType && errors.deviceType ? 'form-error' : ''}`}
            >
              <option value="">Select Device Type</option>
              <option value="smartphone">Smartphone</option>
              <option value="laptop">Laptop</option>
              <option value="tablet">Tablet</option>
              <option value="camera">Camera</option>
              <option value="gaming-console">Gaming Console</option>
              <option value="smartwatch">Smartwatch</option>
              <option value="other">Other</option>
            </select>
            {touched.deviceType && errors.deviceType && (
              <div className="error-message">{errors.deviceType}</div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="deviceBrand" className="form-label">Brand *</label>
              <input
                type="text"
                id="deviceBrand"
                name="deviceBrand"
                placeholder="e.g., Apple, Samsung, Dell"
                value={values.deviceBrand}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${touched.deviceBrand && errors.deviceBrand ? 'form-error' : ''}`}
              />
              {touched.deviceBrand && errors.deviceBrand && (
                <div className="error-message">{errors.deviceBrand}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="deviceModel" className="form-label">Model *</label>
              <input
                type="text"
                id="deviceModel"
                name="deviceModel"
                placeholder="e.g., iPhone 15, MacBook Pro"
                value={values.deviceModel}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${touched.deviceModel && errors.deviceModel ? 'form-error' : ''}`}
              />
              {touched.deviceModel && errors.deviceModel && (
                <div className="error-message">{errors.deviceModel}</div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="purchaseDate" className="form-label">Purchase Date *</label>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                value={values.purchaseDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${touched.purchaseDate && errors.purchaseDate ? 'form-error' : ''}`}
              />
              {touched.purchaseDate && errors.purchaseDate && (
                <div className="error-message">{errors.purchaseDate}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="deviceValue" className="form-label">Current Value ($) *</label>
              <input
                type="number"
                id="deviceValue"
                name="deviceValue"
                placeholder="Current market value"
                min="100"
                max="50000"
                value={values.deviceValue}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${touched.deviceValue && errors.deviceValue ? 'form-error' : ''}`}
              />
              {touched.deviceValue && errors.deviceValue && (
                <div className="error-message">{errors.deviceValue}</div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (values.subType === 'Event Insurance') {
      return (
        <div className="dynamic-fields">
          <h3 className="section-title">Event Details 🎉</h3>

          <div className="form-group">
            <label htmlFor="eventType" className="form-label">Event Type *</label>
            <select
              id="eventType"
              name="eventType"
              value={values.eventType}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-select ${touched.eventType && errors.eventType ? 'form-error' : ''}`}
            >
              <option value="">Select Event Type</option>
              <option value="wedding">Wedding</option>
              <option value="birthday">Birthday Party</option>
              <option value="corporate">Corporate Event</option>
              <option value="concert">Concert/Music Event</option>
              <option value="festival">Festival</option>
              <option value="conference">Conference</option>
              <option value="other">Other</option>
            </select>
            {touched.eventType && errors.eventType && (
              <div className="error-message">{errors.eventType}</div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="eventDate" className="form-label">Event Date *</label>
              <input
                type="date"
                id="eventDate"
                name="eventDate"
                value={values.eventDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${touched.eventDate && errors.eventDate ? 'form-error' : ''}`}
              />
              {touched.eventDate && errors.eventDate && (
                <div className="error-message">{errors.eventDate}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="expectedGuests" className="form-label">Expected Guests *</label>
              <input
                type="number"
                id="expectedGuests"
                name="expectedGuests"
                placeholder="Number of attendees"
                min="1"
                max="10000"
                value={values.expectedGuests}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${touched.expectedGuests && errors.expectedGuests ? 'form-error' : ''}`}
              />
              {touched.expectedGuests && errors.expectedGuests && (
                <div className="error-message">{errors.expectedGuests}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="eventLocation" className="form-label">Event Location *</label>
            <input
              type="text"
              id="eventLocation"
              name="eventLocation"
              placeholder="Venue name and address"
              value={values.eventLocation}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${touched.eventLocation && errors.eventLocation ? 'form-error' : ''}`}
            />
            {touched.eventLocation && errors.eventLocation && (
              <div className="error-message">{errors.eventLocation}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="eventBudget" className="form-label">Event Budget ($) *</label>
            <input
              type="number"
              id="eventBudget"
              name="eventBudget"
              placeholder="Total event budget"
              min="500"
              value={values.eventBudget}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${touched.eventBudget && errors.eventBudget ? 'form-error' : ''}`}
            />
            {touched.eventBudget && errors.eventBudget && (
              <div className="error-message">{errors.eventBudget}</div>
            )}
          </div>
        </div>
      );
    }

    if (values.insuranceType === 'life') {
      return (
        <div className="dynamic-fields">
          <h3 className="section-title">Life Insurance Details 🏥</h3>

          <div className="form-group">
            <label htmlFor="coverageAmount" className="form-label">Coverage Amount ($) *</label>
            <select
              id="coverageAmount"
              name="coverageAmount"
              value={values.coverageAmount}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-select ${touched.coverageAmount && errors.coverageAmount ? 'form-error' : ''}`}
            >
              <option value="">Select Coverage Amount</option>
              <option value="50000">$50,000</option>
              <option value="100000">$100,000</option>
              <option value="250000">$250,000</option>
              <option value="500000">$500,000</option>
              <option value="1000000">$1,000,000</option>
              <option value="2000000">$2,000,000</option>
              <option value="5000000">$5,000,000</option>
            </select>
            {touched.coverageAmount && errors.coverageAmount && (
              <div className="error-message">{errors.coverageAmount}</div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="beneficiaryName" className="form-label">Primary Beneficiary Name *</label>
              <input
                type="text"
                id="beneficiaryName"
                name="beneficiaryName"
                placeholder="Full name of beneficiary"
                value={values.beneficiaryName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${touched.beneficiaryName && errors.beneficiaryName ? 'form-error' : ''}`}
              />
              {touched.beneficiaryName && errors.beneficiaryName && (
                <div className="error-message">{errors.beneficiaryName}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="beneficiaryRelationship" className="form-label">Relationship *</label>
              <select
                id="beneficiaryRelationship"
                name="beneficiaryRelationship"
                value={values.beneficiaryRelationship}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-select ${touched.beneficiaryRelationship && errors.beneficiaryRelationship ? 'form-error' : ''}`}
              >
                <option value="">Select Relationship</option>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="other-family">Other Family Member</option>
                <option value="partner">Domestic Partner</option>
                <option value="trust">Trust</option>
                <option value="other">Other</option>
              </select>
              {touched.beneficiaryRelationship && errors.beneficiaryRelationship && (
                <div className="error-message">{errors.beneficiaryRelationship}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="smokingStatus" className="form-label">Smoking Status *</label>
            <select
              id="smokingStatus"
              name="smokingStatus"
              value={values.smokingStatus}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-select ${touched.smokingStatus && errors.smokingStatus ? 'form-error' : ''}`}
            >
              <option value="">Select Smoking Status</option>
              <option value="never">Never Smoked</option>
              <option value="former">Former Smoker (quit over 12 months ago)</option>
              <option value="current">Current Smoker</option>
            </select>
            {touched.smokingStatus && errors.smokingStatus && (
              <div className="error-message">{errors.smokingStatus}</div>
            )}
          </div>

          {values.subType === 'Family Cover' && (
            <div className="form-group">
              <label htmlFor="familyMembers" className="form-label">Number of Family Members *</label>
              <input
                type="number"
                id="familyMembers"
                name="familyMembers"
                placeholder="Including yourself"
                min="2"
                max="10"
                value={values.familyMembers}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${touched.familyMembers && errors.familyMembers ? 'form-error' : ''}`}
              />
              {touched.familyMembers && errors.familyMembers && (
                <div className="error-message">{errors.familyMembers}</div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (values.insuranceType === 'auto') {
      return (
        <div className="dynamic-fields">
          <h3 className="section-title">Vehicle Information 🚗</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vehicleMake" className="form-label">Vehicle Make *</label>
              <input
                type="text"
                id="vehicleMake"
                name="vehicleMake"
                placeholder="e.g., Toyota, Ford, BMW"
                value={values.vehicleMake}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${touched.vehicleMake && errors.vehicleMake ? 'form-error' : ''}`}
              />
              {touched.vehicleMake && errors.vehicleMake && (
                <div className="error-message">{errors.vehicleMake}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="vehicleModel" className="form-label">Vehicle Model *</label>
              <input
                type="text"
                id="vehicleModel"
                name="vehicleModel"
                placeholder="e.g., Camry, F-150, X5"
                value={values.vehicleModel}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${touched.vehicleModel && errors.vehicleModel ? 'form-error' : ''}`}
              />
              {touched.vehicleModel && errors.vehicleModel && (
                <div className="error-message">{errors.vehicleModel}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="vehicleYear" className="form-label">Year *</label>
              <input
                type="number"
                id="vehicleYear"
                name="vehicleYear"
                placeholder="e.g., 2020"
                min="1990"
                max={new Date().getFullYear() + 1}
                value={values.vehicleYear}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${touched.vehicleYear && errors.vehicleYear ? 'form-error' : ''}`}
              />
              {touched.vehicleYear && errors.vehicleYear && (
                <div className="error-message">{errors.vehicleYear}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="vehicleVin" className="form-label">Vehicle VIN *</label>
            <input
              type="text"
              id="vehicleVin"
              name="vehicleVin"
              placeholder="17-character Vehicle Identification Number"
              maxLength="17"
              value={values.vehicleVin}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${touched.vehicleVin && errors.vehicleVin ? 'form-error' : ''}`}
            />
            {touched.vehicleVin && errors.vehicleVin && (
              <div className="error-message">{errors.vehicleVin}</div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="annualMileage" className="form-label">Annual Mileage *</label>
              <input
                type="number"
                id="annualMileage"
                name="annualMileage"
                placeholder="Miles driven per year"
                min="1000"
                max="100000"
                value={values.annualMileage}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${touched.annualMileage && errors.annualMileage ? 'form-error' : ''}`}
              />
              {touched.annualMileage && errors.annualMileage && (
                <div className="error-message">{errors.annualMileage}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="drivingExperience" className="form-label">Years of Driving Experience *</label>
              <input
                type="number"
                id="drivingExperience"
                name="drivingExperience"
                placeholder="Years you've been driving"
                min="0"
                max="70"
                value={values.drivingExperience}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${touched.drivingExperience && errors.drivingExperience ? 'form-error' : ''}`}
              />
              {touched.drivingExperience && errors.drivingExperience && (
                <div className="error-message">{errors.drivingExperience}</div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="quote-form-page">
      <div className="quote-form-container">
        <div className="quote-form-header">
          <button onClick={goBack} className="back-button">
            ← Back to Services
          </button>
          <h1 className="quote-form-title">Get Your Insurance Quote</h1>
          {preFilledData.subType && (
            <p className="quote-form-subtitle">
              Getting quote for: <strong>{preFilledData.subType}</strong>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="quote-form">
          <div className="form-group">
            <label htmlFor="insuranceType" className="form-label">
              Insurance Type *
            </label>
            <select
              id="insuranceType"
              name="insuranceType"
              value={values.insuranceType}
              onChange={handleInsuranceTypeChange}
              onBlur={handleBlur}
              className={`form-select ${touched.insuranceType && errors.insuranceType ? 'form-error' : ''}`}
            >
              <option value="">Select Insurance Type</option>
              <option value="short-term">Short-Term Insurance</option>
              <option value="life">Life Insurance</option>
              <option value="auto">Auto Insurance</option>
            </select>

            {touched.insuranceType && errors.insuranceType && (
              <div className="error-message">{errors.insuranceType}</div>
            )}
          </div>

          {values.insuranceType && (
            <div className="form-group">
              <label htmlFor="subType" className="form-label">
                Specific Insurance *
              </label>
              <select
                id="subType"
                name="subType"
                value={values.subType}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-select ${touched.subType && errors.subType ? 'form-error' : ''}`}
              >
                <option value="">Select Specific Insurance</option>
                {insuranceOptions[values.insuranceType]?.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              {touched.subType && errors.subType && (
                <div className="error-message">{errors.subType}</div>
              )}
            </div>
          )}

          <div className="form-section">
            <h3 className="section-title">Personal Information 👤</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="Enter your first name"
                  value={values.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${touched.firstName && errors.firstName ? 'form-error' : ''}`}
                />

                {touched.firstName && errors.firstName && (
                  <div className="error-message">{errors.firstName}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Enter your last name"
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${touched.lastName && errors.lastName ? 'form-error' : ''}`}
                />

                {touched.lastName && errors.lastName && (
                  <div className="error-message">{errors.lastName}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${touched.email && errors.email ? 'form-error' : ''}`}
                />

                {touched.email && errors.email && (
                  <div className="error-message">{errors.email}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${touched.phone && errors.phone ? 'form-error' : ''}`}
                />

                {touched.phone && errors.phone && (
                  <div className="error-message">{errors.phone}</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth" className="form-label">
                Date of Birth *
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={values.dateOfBirth}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${touched.dateOfBirth && errors.dateOfBirth ? 'form-error' : ''}`}
              />

              {touched.dateOfBirth && errors.dateOfBirth && (
                <div className="error-message">{errors.dateOfBirth}</div>
              )}
            </div>
          </div>

          {renderDynamicFields()}

          {values.subType && (
            <div className="selected-insurance-info">
              <h3>Selected Insurance Details:</h3>
              <div className="insurance-details">
                <p><strong>Type:</strong> {values.subType}</p>
                {preFilledData.price && values.subType === preFilledData.subType && (
                  <>
                    <p><strong>Starting Price:</strong> {preFilledData.price}</p>
                    <p><strong>Description:</strong> {preFilledData.description}</p>
                  </>
                )}
                {values.subType !== preFilledData.subType && (
                  <p><em>Price and details will be calculated based on your selections</em></p>
                )}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={goBack} className="btn-secondary">
              Cancel
            </button>

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Submitting...
                </>
              ) : (
                'Get Quote 🚀'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
