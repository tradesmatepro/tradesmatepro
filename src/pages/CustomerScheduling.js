import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getSmartSchedulingSuggestions,
  createScheduleEvent,
  formatTimeSlot,
  getSchedulingSettings
} from '../utils/smartScheduling';
import {
  CalendarDaysIcon,
  ClockIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { supaFetch } from '../utils/supaFetch';
import { formatCurrency } from '../utils/formatters';

const CustomerScheduling = () => {
  const [searchParams] = useSearchParams();
  const [quote, setQuote] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const quoteId = searchParams.get('quote_id');
  const customerId = searchParams.get('customer_id');
  const duration = parseInt(searchParams.get('duration')) || 120;

  useEffect(() => {
    if (quoteId && customerId) {
      loadQuoteAndCustomer();
      loadAvailableSlots();
    } else {
      setError('Invalid scheduling link');
      setLoading(false);
    }
  }, [quoteId, customerId]);

  const loadQuoteAndCustomer = async () => {
    try {
      // Unified pipeline using work_orders as quotes
      {
        const quoteRes = await supaFetch(`work_orders?id=eq.${quoteId}&select=*`, { method: 'GET' }, null);
        if (!quoteRes.ok) throw new Error('Failed to load quote');
        const [q] = await quoteRes.json();
        if (!q) { setError('Quote not found'); return; }
        setQuote(q);
        const custRes = await supaFetch(`customers?id=eq.${customerId}`, { method: 'GET' }, q.company_id);
        if (!custRes.ok) throw new Error('Failed to load customer');
        const customers = await custRes.json();
        if (customers.length > 0) { setCustomer(customers[0]); } else { setError('Customer not found'); }
        return;
      }

      // Load quote
      const quoteResponse = await fetch(
        `https://amgtktrwpdsigcomavlg.supabase.co/rest/v1/quotes?id=eq.${quoteId}&select=*`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSIsInNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64'
          }
        }
      );

      // Load customer
      const customerResponse = await fetch(
        `https://amgtktrwpdsigcomavlg.supabase.co/rest/v1/customers?id=eq.${customerId}&company_id=eq.${quote.company_id}&select=*`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64'
          }
        }
      );

      if (quoteResponse.ok && customerResponse.ok) {
        const quotes = await quoteResponse.json();
        const customers = await customerResponse.json();

        if (quotes.length > 0 && customers.length > 0) {
          setQuote(quotes[0]);
          setCustomer(customers[0]);
        } else {
          setError('Quote or customer not found');
        }
      } else {
        setError('Failed to load quote or customer information');
      }
    } catch (error) {
      setError('Error loading information');
    }
  };

  const loadAvailableSlots = async () => {
    try {
      if (!quote?.company_id) return;

      // Get all employees for the company - use status field instead of active
      const employeesResponse = await fetch(
        `https://amgtktrwpdsigcomavlg.supabase.co/rest/v1/profiles?company_id=eq.${quote.company_id}&status=eq.ACTIVE&select=id`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64'
          }
        }
      );

      if (employeesResponse.ok) {
        const employees = await employeesResponse.json();
        const employeeIds = employees.map(e => e.id);

        if (employeeIds.length > 0) {
          const suggestions = await getSmartSchedulingSuggestions(
            employeeIds,
            duration,
            quote.company_id
          );

          // Flatten all available slots from all employees
          const allSlots = [];
          Object.values(suggestions.suggestions).forEach(employeeData => {
            employeeData.available_slots.forEach(slot => {
              allSlots.push({
                ...slot,
                employee_id: employeeData.employee_id
              });
            });
          });

          // Sort by date and time
          allSlots.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

          setAvailableSlots(allSlots.slice(0, 20)); // Limit to 20 slots
        }
      }
    } catch (error) {
      setError('Error loading available time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelection = (slot) => {
    setSelectedSlot(slot);
  };

  const submitAppointment = async () => {
    if (!selectedSlot || !quote || !customer) return;

    setSubmitting(true);
    try {
      // Check if auto-approval is enabled
      const settings = await getSchedulingSettings(quote.company_id);

      const eventData = {
        employee_id: selectedSlot.employee_id,
        company_id: quote.company_id,
        customer_id: customer.id,
        quote_id: quote.id,
        title: `${quote.title || 'Service'} - ${customer.name}`,
        description: `Customer self-scheduled appointment\nQuote: ${quote.title}\nCustomer: ${customer.name}`,
        start_time: selectedSlot.start_time.toISOString(),
        end_time: selectedSlot.end_time.toISOString(),
        event_type: 'customer_appointment',
        status: settings.auto_approve_customer_selections ? 'confirmed' : 'pending_approval',
        created_by: null, // Customer created
        customer_scheduled: true
      };

      const result = await createScheduleEvent(eventData);

      if (result.success) {
        setSubmitted(true);
      } else {
        setError(`Failed to schedule appointment: ${result.error}`);
      }
    } catch (error) {
      setError('Error submitting appointment request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Scheduling Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckIcon className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Appointment Requested</h2>
          <p className="text-gray-600 mb-4">
            Your appointment request has been submitted successfully. You will receive a confirmation once it's approved.
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Selected Time:</strong><br />
              {selectedSlot && formatTimeSlot(selectedSlot)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-primary-600 text-white p-6">
            <h1 className="text-2xl font-bold">Schedule Your Appointment</h1>
            <p className="text-primary-100 mt-1">
              Choose a convenient time for your service
            </p>
          </div>

          {/* Quote Information */}
          {quote && customer && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Service</p>
                  <p className="font-medium">{quote.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">{duration} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium">{customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-medium">{formatCurrency(quote.total_amount)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Available Time Slots */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <CalendarDaysIcon className="w-5 h-5 inline mr-2" />
              Available Time Slots
            </h3>

            {availableSlots.length === 0 ? (
              <div className="text-center py-8">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No available slots</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Please contact us directly to schedule your appointment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => handleSlotSelection(slot)}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      selectedSlot === slot
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {formatTimeSlot(slot)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {slot.duration_minutes} minutes
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          {selectedSlot && (
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={submitAppointment}
                disabled={submitting}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckIcon className="w-4 h-4" />
                )}
                {submitting ? 'Submitting...' : 'Request Appointment'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerScheduling;
