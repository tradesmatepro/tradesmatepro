import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  createScheduleEvent,
  formatTimeSlot,
  getSchedulingSettings
} from '../utils/smartScheduling';
import {
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { supaFetch } from '../utils/supaFetch';
import { formatCurrency } from '../utils/formatters';
import SchedulingWidget from '../components/SchedulingWidget';

const CustomerScheduling = () => {
  const [searchParams] = useSearchParams();
  const [quote, setQuote] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [employeeIds, setEmployeeIds] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const quoteId = searchParams.get('quote_id');
  const customerId = searchParams.get('customer_id');
  const duration = parseInt(searchParams.get('duration')) || 120;

  // Get Supabase config from environment
  const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://cxlqzejzraczumqmsrcx.supabase.co';
  const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODU0NDMsImV4cCI6MjA3NDU2MTQ0M30.zoD59re6xxW9Z6HOexR0qwWwTBU29MvjwP_y8qwBkkg';

  useEffect(() => {
    if (quoteId && customerId) {
      loadQuoteAndCustomer();
    } else {
      setError('Invalid scheduling link');
      setLoading(false);
    }
  }, [quoteId, customerId]);

  const loadQuoteAndCustomer = async () => {
    try {
      // Unified pipeline using work_orders as quotes
      const quoteRes = await supaFetch(`work_orders?id=eq.${quoteId}&select=*`, { method: 'GET' }, null);
      if (!quoteRes.ok) throw new Error('Failed to load quote');
      const quotes = await quoteRes.json();
      const q = quotes[0];
      if (!q) {
        setError('Quote not found');
        setLoading(false);
        return;
      }
      setQuote(q);

      const custRes = await supaFetch(`customers?id=eq.${customerId}`, { method: 'GET' }, q.company_id);
      if (!custRes.ok) throw new Error('Failed to load customer');
      const customers = await custRes.json();
      if (customers.length > 0) {
        setCustomer(customers[0]);
      } else {
        setError('Customer not found');
        setLoading(false);
        return;
      }

      // Load employees for scheduling widget
      const empRes = await supaFetch(`employees?company_id=eq.${q.company_id}&is_schedulable=eq.true&select=id`, { method: 'GET' }, q.company_id);
      if (empRes.ok) {
        const employees = await empRes.json();
        setEmployeeIds(employees.map(e => e.id));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading quote/customer:', error);
      setError('Error loading information');
      setLoading(false);
    }
  };



  const handleSlotSelected = (slot) => {
    setSelectedSlot(slot);
  };

  const handleAutoSchedule = async (slot) => {
    setSelectedSlot(slot);
    // Auto-submit when auto-schedule is clicked
    await submitAppointment(slot);
  };

  const submitAppointment = async (slotToSubmit = null) => {
    const slot = slotToSubmit || selectedSlot;
    if (!slot || !quote || !customer) return;

    setSubmitting(true);
    try {
      // Check if auto-approval is enabled
      const settings = await getSchedulingSettings(quote.company_id);

      const eventData = {
        employee_id: slot.employee_id,
        company_id: quote.company_id,
        customer_id: customer.id,
        quote_id: quote.id,
        title: `${quote.title || 'Service'} - ${customer.name}`,
        description: `Customer self-scheduled appointment\nQuote: ${quote.title}\nCustomer: ${customer.name}`,
        start_time: slot.start_time.toISOString(),
        end_time: slot.end_time.toISOString(),
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
      console.error('Error submitting appointment:', error);
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

          {/* Scheduling Widget */}
          <div className="p-6">
            {employeeIds.length > 0 ? (
              <>
                <SchedulingWidget
                  companyId={quote.company_id}
                  employeeIds={employeeIds}
                  durationMinutes={duration}
                  onSlotSelected={handleSlotSelected}
                  onAutoSchedule={handleAutoSchedule}
                  selectedSlot={selectedSlot}
                  showAutoSchedule={true}
                  maxDaysAhead={90}
                  supabaseUrl={SUPABASE_URL}
                  supabaseAnonKey={SUPABASE_ANON_KEY}
                />

                {/* Submit Button */}
                {selectedSlot && !submitting && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => submitAppointment()}
                      disabled={submitting}
                      className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      <CheckIcon className="w-4 h-4" />
                      Confirm Appointment
                    </button>
                  </div>
                )}

                {submitting && (
                  <div className="mt-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Submitting your appointment...</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Loading available times...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerScheduling;
