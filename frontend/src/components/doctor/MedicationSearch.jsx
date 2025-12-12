import { useState, useEffect, useRef } from 'react';
import { doctorService } from '../../services/doctorService';
import './MedicationSearch.css';

const MedicationSearch = ({ onSelectMedication, selectedMedications = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchMedications = async (value) => {
    try {
      setLoading(true);
      const meds = await doctorService.searchMedications(value, 5);
      setSuggestions(meds || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Failed to search medications:', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (value && value.trim().length > 0) {
      debounceRef.current = setTimeout(() => {
        fetchMedications(value.trim());
      }, 250);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (medication) => {
    // Check if medication is already selected
    const isAlreadySelected = selectedMedications.some(
      med => med.id === medication.id || med.name === medication.name
    );

    if (!isAlreadySelected) {
      // Parse commonDosages and commonFrequencies from JSON string or array
      let dosages = [];
      let frequencies = [];
      
      try {
        if (typeof medication.commonDosages === 'string') {
          dosages = JSON.parse(medication.commonDosages || '[]');
        } else if (Array.isArray(medication.commonDosages)) {
          dosages = medication.commonDosages;
        }
      } catch (e) {
        // If parsing fails, treat as single string
        dosages = medication.commonDosages ? [medication.commonDosages] : [];
      }
      
      try {
        if (typeof medication.commonFrequencies === 'string') {
          frequencies = JSON.parse(medication.commonFrequencies || '[]');
        } else if (Array.isArray(medication.commonFrequencies)) {
          frequencies = medication.commonFrequencies;
        }
      } catch (e) {
        // If parsing fails, treat as single string
        frequencies = medication.commonFrequencies ? [medication.commonFrequencies] : [];
      }

      const newMedication = {
        id: medication.id,
        medicationId: medication.id,
        name: medication.name,
        medicationName: medication.name,
        genericName: medication.genericName,
        category: medication.category,
        dosage: dosages.length > 0 ? dosages[0] : '',
        frequency: frequencies.length > 0 ? frequencies[0] : '',
        commonDosages: dosages, // Store array for dropdown
        commonFrequencies: frequencies, // Store array for dropdown
        quantity: 0,
        instructions: '',
        unit: medication.unit || (medication.name?.toLowerCase().includes('gói') ? 'gói' : 'viên')
      };
      onSelectMedication(newMedication);
    }
    setSearchTerm('');
    setShowSuggestions(false);
  };

  return (
    <div className="medication-search-container">
      <div className="medication-search-wrapper" ref={searchRef}>
        <input
          type="text"
          className="medication-search-input"
          placeholder="Tìm kiếm thuốc (VD: Pana..., Paracetamol...)"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
        <span className="medication-search-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6"/>
                <stop offset="100%" stopColor="#8b5cf6"/>
              </linearGradient>
            </defs>
            <circle cx="11" cy="11" r="7" stroke="url(#searchGradient)" strokeWidth="2"/>
            <path d="m20 20-4-4" stroke="url(#searchGradient)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </span>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="medication-suggestions" ref={suggestionsRef}>
          {suggestions.map((medication) => {
            const isSelected = selectedMedications.some(
              med => med.id === medication.id || med.name === medication.name
            );
            return (
              <div
                key={medication.id}
                className={`medication-suggestion-item ${isSelected ? 'selected' : ''}`}
                onClick={() => !isSelected && handleSelect(medication)}
              >
                <div className="suggestion-name">{medication.name}</div>
                <div className="suggestion-details">
                  <span className="suggestion-generic">{medication.genericName}</span>
                  <span className="suggestion-category">{medication.category}</span>
                </div>
                {isSelected && (
                  <span className="suggestion-checkmark">✓ Đã thêm</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && searchTerm.length > 0 && (
        <div className="medication-suggestions">
          <div className="medication-suggestion-item no-results">
            {loading ? 'Đang tìm...' : 'Không tìm thấy thuốc nào'}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationSearch;

