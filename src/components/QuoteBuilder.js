import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  XMarkIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  CurrencyDollarIcon,
  CalculatorIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  PhotoIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import settingsService from '../services/SettingsService';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import TaxService from '../services/TaxService';
import LaborTable from './LaborTable';
import laborService from '../services/LaborService';
import AddressCard from './AddressCard';
import ServiceAddressSelector from './ServiceAddressSelector';
import ItemLibraryModal from './ItemLibraryModal';
import AddCustomerModal from './AddCustomerModal';
import CPQBuilder from './CPQBuilder';
import InventoryItemsModal from './InventoryItemsModal';
import PresentedModal from './PresentedModal';
import RejectionModal from './RejectionModal';
import ChangesRequestedModal from './ChangesRequestedModal';
import FollowUpModal from './FollowUpModal';
import ApprovalModal from './ApprovalModal';
import QuoteStatusCard from './QuoteStatusCard';
import DocumentsService from '../services/DocumentsService';
// Use actual Tools page components
import {
  ToolsContext,
  SendToQuoteButton,
  AreaCoverageTool,
  RoofingTool,
  MaterialsTool,
  WasteCalculatorTool,
  HVACCoolingTool,
  ConcreteTool,
  ElectricalTool,
  UnitConverterTool,
  LoadCalculatorTool,
  InsulationTool,
  RefrigerantChargeTool,
  DuctSizingTool,
  HeatLossCalculatorTool,
  LinesetChargeTool,
  WireSizeTool,
  ConduitFillTool,
  BreakerSizingTool,
  VoltageDropTool,
  PipeVolumeTool,
  FlowPressureDropTool,
  FixtureUnitTool,
  ShingleBundleTool as RealShingleBundleTool,
  GroutThinsetTool,
  // PaintCoverageTool removed - use AreaCoverageTool instead
  PaintCostTool,
  MulchSoilTool,
  SodSeedTool
} from '../pages/Tools';


// Tool Registry - Maps tool IDs to the real Tools page components
const QuoteToolRegistry = {
  'area-coverage': AreaCoverageTool,
  'roofing': RoofingTool,
  'materials': MaterialsTool,
  'waste': WasteCalculatorTool,
  'concrete': ConcreteTool,
  'load-calculator': LoadCalculatorTool,
  'insulation': InsulationTool,
  'hvac-cooling': HVACCoolingTool,
  'refrigerant-charge': RefrigerantChargeTool,
  'duct-sizing': DuctSizingTool,
  'heat-loss': HeatLossCalculatorTool,
  'lineset-charge': LinesetChargeTool,
  'electrical': ElectricalTool,
  'wire-size': WireSizeTool,
  'conduit-fill': ConduitFillTool,
  'breaker-sizing': BreakerSizingTool,
  'voltage-drop': VoltageDropTool,
  'pipe-volume': PipeVolumeTool,
  'flow-pressure': FlowPressureDropTool,
  'fixture-units': FixtureUnitTool,
  'shingle-bundles': RealShingleBundleTool,
  'grout-thinset': GroutThinsetTool,
  // 'paint-coverage': removed - use 'area-coverage' instead
  'paint-cost': PaintCostTool,
  'mulch-soil': MulchSoilTool,
  'sod-seed': SodSeedTool,
  'unit-converter': UnitConverterTool
};

export const QuoteBuilder = ({
  isEdit = false,
  formData,
  setFormData,
  customers,
  setCustomers, // ✅ FIX: Accept setCustomers prop to add new customers to array
  customersLoading = false,
  onSubmit,
  onCancel,
  onNavigateToCustomers,
  loading = false,
  handleExportPDF,
  handleSendToCustomer,
  showAlert
}) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [rates, setRates] = useState(null); // Will be loaded from database
  const [ratesLoading, setRatesLoading] = useState(true); // Track loading state
  const [laborRows, setLaborRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [actionAfterSave, setActionAfterSave] = useState(null); // 'pdf', 'send', or null
  const [taxDetectionInfo, setTaxDetectionInfo] = useState(null); // Track auto-detected tax info

  // File attachments state
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Helper function to prepare quote data with labor conversion
  const prepareQuoteDataWithLabor = () => {
    console.log('🔧 prepareQuoteDataWithLabor called');
    console.log('🔧 laborRows:', laborRows);
    console.log('🔧 laborRows.length:', laborRows.length);

    // Convert labor rows to quote_items format
    const laborQuoteItems = convertLaborRowsToQuoteItems();
    console.log('🔧 laborQuoteItems after conversion:', laborQuoteItems);
    console.log('🔧 laborQuoteItems.length:', laborQuoteItems.length);

    // Get non-labor items and add calculated total with markup
    const nonLaborItems = formData.quote_items
      .filter(item => item.item_type !== 'labor')
      .map(item => ({
        ...item,
        total: calculateItemTotal(item) // Add total field with markup applied
      }));
    console.log('🔧 nonLaborItems:', nonLaborItems);
    console.log('🔧 nonLaborItems.length:', nonLaborItems.length);

    // Add total field to labor items
    const laborItemsWithTotal = laborQuoteItems.map(item => ({
      ...item,
      total: (item.quantity || 0) * (item.rate || 0) // Labor doesn't get markup
    }));

    // Combine labor and non-labor items
    const combinedQuoteItems = [...laborItemsWithTotal, ...nonLaborItems];
    console.log('🔧 combinedQuoteItems:', combinedQuoteItems);
    console.log('🔧 combinedQuoteItems.length:', combinedQuoteItems.length);

    // Calculate labor summary (matching the format in handleSubmit)
    const labor_summary = laborRows.length > 0 ? {
      crew_size: laborRows[0].employees,
      hours_per_day: laborRows[0].hours_per_day,
      days: laborRows[0].days,
      regular_hours: laborRows[0].regular_hours,
      overtime_hours: laborRows[0].overtime_hours,
      labor_subtotal: laborRows.reduce((sum, r) => sum + (r.line_total || 0), 0)
    } : null;

    console.log('🔧 labor_summary:', labor_summary);

    // Include financial breakdown in submission
    const financialBreakdown = calculateFinancialBreakdown();

    return {
      ...formData,
      quote_items: combinedQuoteItems,
      labor_summary,
      // Add new financial fields to work_orders table
      subtotal: financialBreakdown.subtotal,
      discount_total: financialBreakdown.discount_total,
      tax_total: financialBreakdown.tax_total,
      grand_total: financialBreakdown.grand_total,
      currency: 'USD', // Default currency
      customer_notes: formData.customer_notes || '',
      internal_notes: formData.internal_notes || '',
      payment_terms: formData.payment_terms || rates?.default_payment_terms || 'Net 30'
    };
  };

  // Handle save and then perform additional action
  const handleSaveAndAction = async (e, action) => {
    console.log('🎯 handleSaveAndAction CALLED:', {
      action,
      hasHandleSendToCustomer: !!handleSendToCustomer,
      hasHandleExportPDF: !!handleExportPDF,
      formDataId: formData?.id,
      isEdit
    });

    e.preventDefault();
    setActionAfterSave(action);

    try {
      // ✅ FIX: Prepare quote data with labor conversion BEFORE calling onSubmit
      console.log('🔄 Preparing quote data with labor conversion...');
      const updatedFormData = prepareQuoteDataWithLabor();
      console.log('🔄 Updated formData with labor:', updatedFormData);

      // Call onSubmit with the updated data that includes labor items
      console.log('🔄 Calling onSubmit with labor items...');
      const newQuote = await onSubmit(e, updatedFormData);
      console.log('✅ onSubmit returned:', newQuote);

      // After successful save, perform the action
      // For NEW quotes, use the returned quote with ID
      // For EDIT, use existing formData.id
      const quoteToUse = newQuote || formData;
      console.log('📋 Quote to use for action:', {
        quoteToUse,
        hasId: !!quoteToUse?.id,
        action
      });

      if (action === 'pdf' && handleExportPDF && quoteToUse.id) {
        console.log('📄 Calling handleExportPDF...');
        setTimeout(() => handleExportPDF(quoteToUse), 500);
      } else if (action === 'send' && handleSendToCustomer && quoteToUse.id) {
        console.log('📧 Calling handleSendToCustomer...');
        setTimeout(() => handleSendToCustomer(quoteToUse), 500);
      } else {
        console.log('⚠️ Action not executed:', {
          action,
          hasHandler: action === 'pdf' ? !!handleExportPDF : !!handleSendToCustomer,
          hasQuoteId: !!quoteToUse?.id
        });
      }
    } catch (error) {
      console.error('❌ Error in handleSaveAndAction:', error);
      // Error already shown by showAlert in onSubmit
    } finally {
      setActionAfterSave(null);
    }
  };


  const [showLibrary, setShowLibrary] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showCPQ, setShowCPQ] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [toolPreferences, setToolPreferences] = useState({});
  const [keepToolsOpen, setKeepToolsOpen] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(null); // 'library' | 'cpq' | null

  // ✅ Single source of truth for status modals
  const [activeModal, setActiveModal] = useState(null); // 'presented' | 'changes' | 'followup' | 'rejected' | 'approved' | 'expired' | null
  const [previousStatus, setPreviousStatus] = useState(null); // Track previous status to detect changes

  // ✅ Open modal ONLY when status actively changes (not when loading existing quote)
  useEffect(() => {
    if (!formData?.status) {
      setActiveModal(null);
      setPreviousStatus(null);
      return;
    }

    // If this is the first time we're seeing this status (loading existing quote), don't open modal
    if (previousStatus === null) {
      setPreviousStatus(formData.status);
      return;
    }

    // If status hasn't changed, don't open modal
    if (previousStatus === formData.status) {
      return;
    }

    // Status has changed! Open the appropriate modal
    setPreviousStatus(formData.status);

    switch (formData.status) {
      case 'presented':
        setActiveModal('presented');
        break;
      case 'changes_requested':
        setActiveModal('changes');
        break;
      case 'follow_up':
        setActiveModal('followup');
        break;
      case 'rejected':
        setActiveModal('rejected');
        break;
      case 'approved':
        setActiveModal('approved');
        break;
      case 'expired':
        setActiveModal(null); // No modal for expired
        break;
      default:
        setActiveModal(null);
    }
  }, [formData?.status, previousStatus]);

  useEffect(() => {
    console.log('🔧 QuoteBuilder useEffect triggered, user:', user);
    console.log('🔧 Company ID from user:', user?.company_id);
    loadRates();
    loadEmployees();
    loadToolPreferences();
  }, [user?.company_id]);

  // Load existing attachments when editing a quote
  useEffect(() => {
    const loadAttachments = async () => {
      if (isEdit && formData?.id && user?.company_id) {
        try {
          console.log('📎 Loading attachments for work_order_id:', formData.id);

          const response = await supaFetch(
            `attachments?work_order_id=eq.${formData.id}&select=*&order=uploaded_at.desc`,
            { method: 'GET' },
            user.company_id
          );

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Loaded attachments:', data);
            setAttachedFiles(data || []);
          } else {
            console.error('❌ Failed to load attachments:', response.status);
          }
        } catch (error) {
          console.error('❌ Error loading attachments:', error);
        }
      }
    };

    loadAttachments();
  }, [isEdit, formData?.id, user?.company_id]);

  // Load labor data for existing quotes/work orders (ONLY ONCE on mount)
  const [laborDataLoaded, setLaborDataLoaded] = useState(false);

  useEffect(() => {
    // ✅ FIX: Only load labor data when BOTH formData AND rates are ready
    if (isEdit && formData && rates?.hourly && !laborDataLoaded) {
      console.log('🔍 Loading labor data for edit mode (ONE TIME) with rates:', rates);

      if (formData.labor_summary) {
        console.log('🔍 Restoring laborRows from labor_summary');
        const ls = formData.labor_summary;
        setLaborRows([{
          id: null,
          employees: ls.crew_size,
          hours_per_day: ls.hours_per_day,
          days: ls.days,
          total_hours: (ls.crew_size || 0) * (ls.hours_per_day || 0) * (ls.days || 0),
          regular_hours: ls.regular_hours || 0,
          overtime_hours: ls.overtime_hours || 0,
          line_total: ls.labor_subtotal || 0
        }]);
      } else if (formData.quote_items) {
        console.log('🔍 Calling loadLaborDataFromQuoteItems with rates:', rates);
        loadLaborDataFromQuoteItems();
      }

      setLaborDataLoaded(true); // Mark as loaded to prevent re-runs
    }
  }, [isEdit, formData?.id, rates?.hourly]); // ✅ FIX: Wait for rates to load!

  // Auto-add first labor row when rates are loaded (for new quotes only)
  useEffect(() => {
    if (rates?.hourly && rates.hourly > 0 && !isEdit && laborRows.length === 0) {
      console.log('🎯 Auto-adding first labor row with loaded rates...');
      const firstLaborRow = {
        id: null,
        employees: 1,
        hours_per_day: 8,
        days: 1,
        total_hours: 8,
        regular_hours: 8,
        overtime_hours: 0,
        line_total: 8 * rates.hourly
      };
      console.log('🎯 First labor row with correct rates:', JSON.stringify(firstLaborRow, null, 2));
      setLaborRows([firstLaborRow]);
    }
  }, [rates?.hourly, rates?.overtime, isEdit, laborRows.length]);

  const loadRates = async () => {
    setRatesLoading(true);
    try {
      const companyId = user?.company_id;
      console.log('🔧 QuoteBuilder loadRates called with companyId:', companyId);
      console.log('🔧 User object:', user);

      if (!companyId) {
        console.warn('❌ No company ID found, cannot load rates');
        return;
      }

      console.log('🔧 Loading rates from standardized pricing schema...');
      const settings = await settingsService.getRatesPricingSettings(companyId);
      console.log('🔧 Raw pricing settings:', JSON.stringify(settings, null, 2));

      // Settings service always returns a valid object with defaults, so no need to check for null
      if (!settings || !settings.laborRates) {
        console.warn('⚠️ No custom rates configured, using system defaults');
      }

      // DEBUG: Log the raw settings to see what we're getting
      console.log('🔍 DEBUG - Raw settings object:', JSON.stringify(settings, null, 2));
      console.log('🔍 DEBUG - settings.markupPercentages:', settings.markupPercentages);
      console.log('🔍 DEBUG - settings.markupPercentages?.materials:', settings.markupPercentages?.materials);

      // Use new standardized pricing structure with backward compatibility
      const newRates = {
        hourly: settings.laborRates?.standard || 75,
        overtime: settings.laborRates?.overtime || 112.5,
        emergency: settings.laborRates?.emergency || 150,
        markup: settings.markupPercentages?.materials ?? 0,  // Use ?? to allow 0 value
        tax: settings.taxRate ?? 0,  // DEFAULT TO 0 (no tax) - auto-detect by zip code
        // Include new pricing data for advanced features
        serviceRates: settings.serviceRates || [],
        pricingRules: settings.pricingRules || [],
        ratesByType: settings.ratesByType || {}
      };
      console.log('💰 Final calculated rates:', JSON.stringify(newRates, null, 2));
      console.log('💰 Previous rates were:', JSON.stringify(rates, null, 2));

      setRates(newRates);
      setRatesLoading(false);
      console.log('✅ Rates updated successfully');
    } catch (error) {
      console.error('❌ Error loading rates:', error);
      console.error('❌ Error stack:', error.stack);

      // Set fallback rates instead of showing error popup
      const fallbackRates = {
        hourly: 75,
        overtime: 112.5,
        emergency: 150,
        markup: 0,  // Default to 0% markup (user can configure in settings)
        tax: 0,  // DEFAULT TO 0 (no tax) - auto-detect by zip code
        serviceRates: [],
        pricingRules: []
      };

      setRates(fallbackRates);
      setRatesLoading(false);
      console.log('⚠️ Using fallback rates due to error');
    }
  };

  const loadEmployees = async () => {
    try {
      const employeeData = await laborService.loadEmployees(user?.company_id);
      setEmployees(employeeData);
    } catch (error) {
      console.error('❌ Error loading employees:', error);
    }
  };

  const loadToolPreferences = async () => {
    if (!user?.id) return;

    try {
      // Tool preferences are stored in localStorage for now
      // In the future, could be stored in profiles.settings JSONB column
      const savedPrefs = localStorage.getItem(`tool_preferences_${user.id}`);
      if (savedPrefs) {
        setToolPreferences(JSON.parse(savedPrefs));
      } else {
        // Use defaults
        setToolPreferences({});
      }
    } catch (error) {
      console.error('Error loading tool preferences:', error);
      // Set empty preferences on error
      setToolPreferences({});
    }
  };

  const loadLaborDataFromQuoteItems = () => {
    try {
      console.log('🔍 loadLaborDataFromQuoteItems called');
      console.log('🔍 formData:', formData);
      console.log('🔍 formData.quote_items:', formData.quote_items);

      if (formData.quote_items && formData.quote_items.length > 0) {
        // Find labor items in quote_items and convert to new format
        const laborItems = formData.quote_items.filter(item => item.item_type === 'labor');
        console.log('🔍 Found labor items:', laborItems);

        if (laborItems.length > 0) {
          console.log('🔄 Converting old labor items to new format:', laborItems);

          const convertedLaborRows = laborItems.map(item => {
            const totalHours = item.quantity || 0;
            console.log('🔍 Converting item:', item, 'totalHours:', totalHours);

            // Simple conversion: assume 1 employee working the total hours
            const employees = 1;
            const hoursPerDay = totalHours;
            const days = 1;

            // Calculate regular vs overtime based on hours per day
            let regularHours, overtimeHours;
            if (hoursPerDay <= 8) {
              regularHours = totalHours;
              overtimeHours = 0;
            } else {
              regularHours = 8;
              overtimeHours = totalHours - 8;
            }

            const lineTotal = (regularHours * (rates?.hourly || 0)) + (overtimeHours * (rates?.overtime || 0));

            const converted = {
              id: null,
              employees: employees,
              hours_per_day: hoursPerDay,
              days: days,
              total_hours: totalHours,
              regular_hours: regularHours,
              overtime_hours: overtimeHours,
              line_total: lineTotal
            };

            console.log('🔄 Converted item to:', converted);
            return converted;
          });

          console.log('🔄 All converted labor rows:', convertedLaborRows);
          setLaborRows(convertedLaborRows);
        } else {
          console.log('🔍 No labor items found in quote_items');
        }
      } else {
        console.log('🔍 No quote_items found or empty array');
      }
    } catch (error) {
      console.error('❌ Error converting labor data:', error);
    }
  };


	  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [customerSearchFeedback, setCustomerSearchFeedback] = useState('');

  /**
   * Auto-detect and apply tax rate based on customer address
   */
  const applyAutoDetectedTax = (customer, serviceAddress = null) => {
    try {
      const detection = TaxService.autoDetectTaxRate(customer, serviceAddress);

      if (detection.detected && detection.taxRate !== undefined) {
        console.log('🧮 Tax auto-detected:', detection);

        // Update form data with detected tax rate
        setFormData(prev => ({
          ...prev,
          tax_rate: detection.taxRate,
          tax_rate_source: detection.source,
          tax_rate_state: detection.state
        }));

        // Show detection info to user
        setTaxDetectionInfo({
          message: detection.message,
          state: detection.state,
          rate: detection.taxRate,
          source: detection.source
        });

        // Auto-hide message after 5 seconds
        setTimeout(() => setTaxDetectionInfo(null), 5000);
      }
    } catch (error) {
      console.error('❌ Error applying auto-detected tax:', error);
    }
  };

  const runCustomerSearch = (query = null) => {
    const qRaw = query !== null ? query : (formData.customer_query || '');
    const q = qRaw.toLowerCase().trim();
    const digits = (s) => (s || '').replace(/\D/g, '');

    // Clear previous results
    setCustomerSearchFeedback('');
    setCustomerSearchResults([]);

    if (customersLoading) {
      setCustomerSearchFeedback('Loading customers...');
      return;
    }

    if (!customers || customers.length === 0) {
      setCustomerSearchFeedback('No customers found. Click "Add new" to create one.');
      return;
    }

    if (q.length === 0) {
      // Don't show results for empty query - only when user actually types
      setCustomerSearchResults([]);
      return;
    }

    if (q.length < 2 && digits(q).length === 0) {
      // Don't show feedback for short queries, just clear results
      return;
    }

    const results = customers.filter((c) => {
      const nameMatch = (c.name && c.name.toLowerCase().includes(q)) ||
                       (c.full_name && c.full_name.toLowerCase().includes(q));
      const emailMatch = c.email && c.email.toLowerCase().includes(q);
      const phoneMatch = digits(c.phone).includes(digits(q)) && digits(q).length > 0;

      return nameMatch || emailMatch || phoneMatch;
    });

    setCustomerSearchResults(results);

    if (results.length === 0 && q.length >= 2) {
      setCustomerSearchFeedback('No matching customers found.');
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  // Auto-search as user types (with debounce) - but only if no customer is selected
  useEffect(() => {
    // Don't search if a customer is already selected
    if (formData.customer_id) {
      setCustomerSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      runCustomerSearch();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData.customer_query, formData.customer_id, customers, customersLoading]);


  const addQuoteItem = () => {
    console.log('➕ Adding new quote item...');
    console.log('➕ Current rates object:', JSON.stringify(rates, null, 2));
    console.log('➕ Using hourly rate:', rates?.hourly);
    console.log('➕ Type of hourly rate:', typeof rates?.hourly);

    const newItem = {
      item_name: '',
      quantity: 1,
      rate: 0, // User will set material/part costs
      item_type: 'material',
      is_overtime: false,
      description: '',
      photo_url: ''
    };

    console.log('➕ New item being added:', JSON.stringify(newItem, null, 2));

    setFormData({
      ...formData,
      quote_items: [
        ...formData.quote_items,
        newItem
      ]
    });
  };

  const addToolResultToQuote = (toolResult, toolName) => {
    const newItem = {
      item_name: toolResult.description || `${toolName} calculation`,
      quantity: parseFloat(toolResult.quantity) || 1,
      rate: parseFloat(toolResult.unit_price) || 0,
      item_type: 'material',
      is_overtime: false,
      description: `Added from ${toolName}${toolResult.unit ? ` (${toolResult.unit})` : ''}`,
      photo_url: ''
    };

    setFormData({
      ...formData,
      quote_items: [
        ...formData.quote_items,
        newItem
      ]
    });

    // Close modal unless user wants to keep it open
    if (!keepToolsOpen) {
      setShowTools(false);
    }

    // Show success feedback
    console.log(`✅ Added ${toolResult.description} to quote`);
  };

  const removeQuoteItem = (actualIndex) => {
    // Remove item by actual index in the full quote_items array
    const newItems = formData.quote_items.filter((_, i) => i !== actualIndex);
    setFormData({ ...formData, quote_items: newItems });
  };

  const updateQuoteItem = (index, field, value) => {
    const newItems = [...formData.quote_items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-calculate rate based on item type and quantity (auto-overtime after 8 hours)
    if (field === 'item_type' || field === 'quantity') {
      const item = newItems[index];
      if (item.item_type === 'labor') {
        const quantity = field === 'quantity' ? value : item.quantity;
        // Auto-apply overtime rate if quantity > 8 hours
        const isOvertime = quantity > 8;
        let rate = isOvertime ? (rates?.overtime || 0) : (rates?.hourly || 0);
        console.log(`🔧 Auto-setting rate for ${quantity}h labor: $${rate} ${isOvertime ? '(OT)' : ''}`);
        newItems[index].rate = rate;
        newItems[index].is_overtime = isOvertime;
      } else if (item.item_type === 'material' || item.item_type === 'equipment') {
        // For materials/equipment, use a base rate if not already set
        if (!newItems[index].rate || newItems[index].rate === (rates?.hourly || 0)) {
          newItems[index].rate = 0; // Let user set material/equipment costs
        }
      }
    }

    setFormData({ ...formData, quote_items: newItems });
  };

  const calculateItemTotal = (item) => {
    let baseTotal = (item.quantity || 0) * (item.rate || 0);

    // Apply markup for materials/equipment
    if (item.item_type === 'material' || item.item_type === 'equipment') {
      baseTotal = baseTotal * (1 + rates.markup / 100);
    }

    return baseTotal;
  };

  // Convert labor rows back to quote_items format for saving
  const convertLaborRowsToQuoteItems = () => {
    console.log('🔧 convertLaborRowsToQuoteItems called');
    console.log('🔧 laborRows to convert:', laborRows);
    console.log('🔧 rates:', rates);

    const converted = laborRows.map((row, index) => {
      const item = {
        item_name: `Labor ${index + 1}`,
        quantity: row.total_hours || 0,
        rate: row.total_hours <= 8 ? (rates?.hourly || 0) :
              ((row.regular_hours * (rates?.hourly || 0)) + (row.overtime_hours * (rates?.overtime || 0))) / row.total_hours,
        item_type: 'labor',
        is_overtime: (row.overtime_hours || 0) > 0,
        description: `${row.employees} employee(s) × ${row.hours_per_day} hours/day × ${row.days} day(s)`,
        photo_url: ''
      };
      console.log(`🔧 Converted labor row ${index}:`, item);
      return item;
    });

    console.log('🔧 Total converted labor items:', converted.length);
    return converted;
  };

  const calculateSubtotal = () => {
    // Calculate materials/parts/services total (excluding labor)
    const itemsTotal = formData.quote_items
      .filter(item => item.item_type !== 'labor')
      .reduce((sum, item) => {
        return sum + calculateItemTotal(item);
      }, 0);

    // Calculate labor total
    const laborTotal = laborRows.reduce((sum, row) => {
      return sum + (row.line_total || 0);
    }, 0);

    return itemsTotal + laborTotal;
  };

	  // Subtotal for non-Time & Materials pricing models
	  const calculateModelSubtotal = () => {
	    const model = formData.pricing_model || 'TIME_MATERIALS';
	    switch (model) {
	      case 'FLAT_RATE':
	        return Number(formData.flat_rate_amount) || 0;
	      case 'UNIT': {
	        // ✅ FIX: Unit pricing should include materials with markup
	        const unitTotal = (Number(formData.unit_count) || 0) * ((Number(formData.unit_price) || 0));
	        const materialsTotal = formData.quote_items
	          .filter(item => item.item_type !== 'labor')
	          .reduce((sum, item) => sum + calculateItemTotal(item), 0);
	        return unitTotal + materialsTotal;
	      }
	      case 'PERCENTAGE': {
	        const pct = Number(formData.percentage) || 0;
	        const base = Number(formData.percentage_base_amount) || 0;
	        return (pct / 100) * base;
	      }
	      case 'RECURRING':
	        // Per-interval preview
	        return Number(formData.recurring_rate) || 0;
	      case 'MILESTONE': {
	        const base = Number(formData.milestone_base_amount) || 0;
	        const list = Array.isArray(formData.milestones) ? formData.milestones : [];
	        const fixed = list.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
	        const pct = list.reduce((sum, m) => sum + (Number(m.percentage) || 0), 0);
	        return fixed + (pct / 100) * base;
	      }
	      default:
	        return calculateSubtotal();
	    }
	  };


  // Show loading state while rates are being fetched
  if (ratesLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600 mb-2">Loading rates and pricing...</div>
            <div className="text-gray-500 text-sm">Please wait while we load your configuration.</div>
          </div>
        </div>
      </div>
    );
  }

  // Only show configuration error if loading is complete and rates are null
  if (!ratesLoading && !rates) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-600 mb-4 text-lg font-semibold">Configuration Required</div>
            <div className="text-gray-600 mb-4">
              Rates and pricing must be configured before creating quotes.
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={() => window.location.href = '/settings'}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Go to Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate financial breakdown using new database fields
  const calculateFinancialBreakdown = () => {
    const subtotal = (formData.pricing_model && formData.pricing_model !== 'TIME_MATERIALS') ?
      calculateModelSubtotal() : calculateSubtotal();
    const discountAmount = parseFloat(formData.discount_total || 0);
    const taxRate = parseFloat(rates?.tax || 0);
    const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
    const grandTotal = subtotal - discountAmount + taxAmount;

    console.log('💰 QuoteBuilder Financial Breakdown:', {
      subtotal,
      discountAmount,
      taxRate,
      taxAmount,
      grandTotal,
      calculation: `(${subtotal} - ${discountAmount}) * (${taxRate} / 100) = ${taxAmount}`,
      total_calc: `${subtotal} - ${discountAmount} + ${taxAmount} = ${grandTotal}`
    });

    return {
      subtotal: subtotal,
      discount_total: discountAmount,
      tax_total: taxAmount,
      grand_total: grandTotal
    };
  };

  const financials = calculateFinancialBreakdown();
  const { subtotal, tax_total: tax, grand_total: total } = financials;

  // File upload handlers
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFiles(true);
    try {
      const workOrderId = formData.id; // Only upload if quote already exists

      for (const file of files) {
        // Upload file using DocumentsService
        const result = await DocumentsService.uploadAttachment(
          user.company_id,
          workOrderId, // Can be null for new quotes
          file,
          user.id,
          ['quote'], // Auto-tag as quote attachment
          '' // No OCR text
        );

        if (result.success) {
          setAttachedFiles(prev => [...prev, {
            id: result.attachment?.id,
            file_name: file.name,
            file_url: result.attachment?.file_url,
            file_size: file.size,
            uploaded_at: new Date().toISOString()
          }]);
        }
      }

      // Reset file input
      e.target.value = '';

      if (showAlert) {
        showAlert('Files uploaded successfully!', 'success');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      if (showAlert) {
        showAlert('Failed to upload files: ' + error.message, 'error');
      }
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleRemoveFile = async (fileId) => {
    try {
      // Delete from database
      await supaFetch(`attachments?id=eq.${fileId}`, {
        method: 'DELETE'
      }, user.company_id);

      // Remove from state
      setAttachedFiles(prev => prev.filter(f => f.id !== fileId));

      if (showAlert) {
        showAlert('File removed successfully!', 'success');
      }
    } catch (error) {
      console.error('Error removing file:', error);
      if (showAlert) {
        showAlert('Failed to remove file: ' + error.message, 'error');
      }
    }
  };

  // Handle form submission with labor data conversion
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('🎯 HANDLESUBMIT: formData.status at submit time:', formData.status);

    // ✅ FIX: Use the shared helper function to prepare data with labor conversion
    const updatedFormData = prepareQuoteDataWithLabor();

    console.log('🔄 Submitting quote with financial breakdown:', updatedFormData);
    console.log('🎯 HANDLESUBMIT: updatedFormData.status:', updatedFormData.status);
    console.log('🔄 Calling onSubmit...');
    const result = onSubmit(e, { ...updatedFormData, skipInterceptors: true });
    console.log('✅ onSubmit returned:', result);
    return result;
  };

  return (
    <>
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            {isEdit ? 'Edit Quote' : 'Create New Quote - UPDATED VERSION'}
          </h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowTools(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Open Calculator Tools"
            >
              <CalculatorIcon className="w-4 h-4" />
              Tools
            </button>
            <button
              onClick={onCancel}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form id="quote-form" onSubmit={handleSubmit}>
          {/* Status Card - Shows modal data for presented, changes_requested, follow_up, rejected */}
          {isEdit && <QuoteStatusCard quote={formData} />}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Quote Information */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Quote Information
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quote Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="HVAC Installation, Electrical Repair, etc."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Customer *
                  </label>
                  <button
                    type="button"
                    className="text-sm text-primary-600 hover:text-primary-800"
                    onClick={() => setShowAddCustomer(true)}
                  >
                    + Add new customer
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.customer_query || ''}
                    onChange={(e) => {
                      const newQuery = e.target.value;
                      // Clear customer selection if user is typing (allows changing selection)
                      if (formData.customer_id && newQuery !== formData.customer_query) {
                        setFormData({ ...formData, customer_query: newQuery, customer_id: '' });
                      } else {
                        setFormData({ ...formData, customer_query: newQuery });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Start typing to search customers..."
                  />

                  {customerSearchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 border border-gray-300 rounded-md bg-white shadow-lg">
                      <ul className="max-h-40 overflow-auto">
                        {customerSearchResults.map((c) => (
                          <li key={c.id} className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0" onClick={() => {
                            setFormData({ ...formData, customer_id: c.id, customer_query: c.name || c.full_name });
                            setCustomerSearchResults([]);
                            setCustomerSearchFeedback('');
                            // 🧮 Auto-detect tax rate when customer is selected
                            applyAutoDetectedTax(c, formData.service_address);
                          }}>
                            <div className="text-sm font-medium text-gray-900 truncate">{c.name || c.full_name}</div>
                            <div className="text-xs text-gray-500 truncate">{[c.phone, c.email].filter(Boolean).join(' · ')}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {customerSearchFeedback && (
                  <div className="text-xs text-gray-500 mt-1">{customerSearchFeedback}</div>
                )}

                {/* Customer Info Card */}
                {formData.customer_id && (
                  <div className="mt-3">
                    <div className="flex justify-end mb-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, customer_id: '', customer_query: '' })}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Change Customer
                      </button>
                    </div>
                    <ServiceAddressSelector
                      customer={customers.find(c => c.id === formData.customer_id)}
                      selectedAddress={formData.service_address}
                      onAddressChange={(address) => {
                        setFormData({ ...formData, service_address: address });
                        // 🧮 Re-detect tax when service address changes
                        const customer = customers.find(c => c.id === formData.customer_id);
                        if (customer) {
                          applyAutoDetectedTax(customer, address);
                        }
                      }}
                    />
                  </div>
                )}
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Model *</label>
                <select
                  value={formData.pricing_model || 'TIME_MATERIALS'}
                  onChange={(e) => setFormData({ ...formData, pricing_model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="TIME_MATERIALS">Time & Materials - Hourly rate + materials</option>
                  <option value="FLAT_RATE">Flat Rate - Fixed price for entire job</option>
                  <option value="UNIT">Unit-Based - Price per unit (sq ft, outlet, fixture)</option>
                  <option value="PERCENTAGE">Percentage - % of base amount (subcontractors)</option>
                  <option value="MILESTONE">Milestone - Progress-based payments</option>
                  <option value="RECURRING">Recurring - Subscription/maintenance contracts</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {formData.pricing_model === 'TIME_MATERIALS' && 'Charge for time spent + materials used'}
                  {formData.pricing_model === 'FLAT_RATE' && 'One fixed price for the entire job'}
                  {formData.pricing_model === 'UNIT' && 'Price multiplied by number of units'}
                  {formData.pricing_model === 'PERCENTAGE' && 'Percentage of total project cost'}
                  {formData.pricing_model === 'MILESTONE' && 'Payment schedule based on project milestones'}
                  {formData.pricing_model === 'RECURRING' && 'Regular recurring payments (monthly, quarterly, etc.)'}
                </p>
              </div>

              {/* Model-specific inputs */}
              {formData.pricing_model === 'FLAT_RATE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flat Rate Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.flat_rate_amount || ''}
                    onChange={(e) => setFormData({ ...formData, flat_rate_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}

              {formData.pricing_model === 'UNIT' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Count</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={formData.unit_count || ''}
                      onChange={(e) => setFormData({ ...formData, unit_count: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.unit_price || ''}
                      onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}

              {formData.pricing_model === 'PERCENTAGE' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Percentage (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.percentage || ''}
                      onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.percentage_base_amount || ''}
                      onChange={(e) => setFormData({ ...formData, percentage_base_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}

              {formData.pricing_model === 'RECURRING' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recurring Interval</label>
                    <select
                      value={formData.recurring_interval || ''}
                      onChange={(e) => setFormData({ ...formData, recurring_interval: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="YEARLY">Yearly</option>
                      <option value="CUSTOM">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rate (per interval)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.recurring_rate || ''}
                      onChange={(e) => setFormData({ ...formData, recurring_rate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  {formData.recurring_interval === 'CUSTOM' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Custom Interval (days)</label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={formData.recurring_custom_interval_days || ''}
                        onChange={(e) => setFormData({ ...formData, recurring_custom_interval_days: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {formData.pricing_model === 'MILESTONE' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Amount for % Milestones</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.milestone_base_amount || ''}
                      onChange={(e) => setFormData({ ...formData, milestone_base_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="space-y-2">
                    {(formData.milestones || []).map((m, idx) => (
                      <div key={idx} className="border rounded p-3 grid grid-cols-1 md:grid-cols-6 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Milestone Name</label>
                          <input
                            type="text"
                            value={m.name || ''}
                            onChange={(e) => {
                              const arr = [...(formData.milestones || [])];
                              arr[idx] = { ...arr[idx], name: e.target.value };
                              setFormData({ ...formData, milestones: arr });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={m.amount ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const arr = [...(formData.milestones || [])];
                              arr[idx] = { ...arr[idx], amount: val === '' ? null : parseFloat(val), percentage: null };
                              setFormData({ ...formData, milestones: arr });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Percentage (%)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={m.percentage ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const arr = [...(formData.milestones || [])];
                              arr[idx] = { ...arr[idx], percentage: val === '' ? null : parseFloat(val), amount: null };
                              setFormData({ ...formData, milestones: arr });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Sort</label>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={m.sort_order ?? idx}
                            onChange={(e) => {
                              const arr = [...(formData.milestones || [])];
                              arr[idx] = { ...arr[idx], sort_order: parseInt(e.target.value) || 0 };
                              setFormData({ ...formData, milestones: arr });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                          <input
                            type="date"
                            value={m.due_date || ''}
                            onChange={(e) => {
                              const arr = [...(formData.milestones || [])];
                              arr[idx] = { ...arr[idx], due_date: e.target.value };
                              setFormData({ ...formData, milestones: arr });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div className="flex items-end justify-between">
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={!!m.required}
                              onChange={(e) => {
                                const arr = [...(formData.milestones || [])];
                                arr[idx] = { ...arr[idx], required: e.target.checked };
                                setFormData({ ...formData, milestones: arr });
                              }}
                            />
                            <span>Required</span>
                          </label>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => {
                              const arr = [...(formData.milestones || [])];
                              arr.splice(idx, 1);
                              setFormData({ ...formData, milestones: arr });
                            }}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setFormData({ ...formData, milestones: [...(formData.milestones || []), { name: '', amount: null, percentage: null, sort_order: (formData.milestones?.length || 0), required: true }] })}
                    >
                      Add Milestone
                    </button>
                  </div>
                </div>
              )}


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  data-testid="quote-status-select"
                  value={formData.status}
                  onChange={(e) => {
                    console.log('🔄 STATUS CHANGED:', { from: formData.status, to: e.target.value });
                    setFormData({...formData, status: e.target.value});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {/* ✅ COMPETITIVE ADVANTAGE - Best of Jobber, Housecall Pro, ServiceTitan */}
                  <optgroup label="Quote Stage">
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="presented">Presented (In-Person)</option>
                    <option value="changes_requested">Changes Requested</option>
                    <option value="follow_up">Follow-up Needed</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </optgroup>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  <strong>New!</strong> Presented (ServiceTitan) | Changes Requested (Jobber) | Follow-up (ServiceTitan) | Expired (Housecall Pro)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Describe the work to be performed..."
                />
              </div>

              {/* Internal Notes - NOT visible to customer (industry standard like Jobber) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  Internal Notes
                  <span className="text-xs text-gray-500 font-normal">(Private - not visible to customer)</span>
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Private notes for your team only..."
                />
              </div>

              {/* Payment Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                <select
                  value={formData.payment_terms || 'Net 30'}
                  onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                  <option value="50% Deposit, Balance on Completion">50% Deposit, Balance on Completion</option>
                </select>
              </div>

              {/* Customer Notes - Visible on quote/invoice PDF (industry standard like Jobber) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  Customer Notes
                  <span className="text-xs text-gray-500 font-normal">(Visible to customer on PDF)</span>
                </label>
                <textarea
                  value={formData.customer_notes || ''}
                  onChange={(e) => setFormData({...formData, customer_notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="2"
                  placeholder="Notes visible to customer on quote/invoice PDF..."
                />
              </div>

              {/* File Attachments - Photos, Documents, etc. */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <PaperClipIcon className="w-5 h-5" />
                  Attachments
                  <span className="text-xs text-gray-500 font-normal">(Photos, diagrams, reference docs)</span>
                </label>

                {/* Upload Button */}
                <div className="mb-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">
                    <PhotoIcon className="w-5 h-5" />
                    <span>{uploadingFiles ? 'Uploading...' : 'Upload Files'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      disabled={uploadingFiles}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Attach photos of the problem area, diagrams, or reference documents
                  </p>
                </div>

                {/* Attached Files List */}
                {attachedFiles.length > 0 && (
                  <div className="space-y-2">
                    {attachedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              // Generate signed URL for private file
                              const signedUrl = await DocumentsService.getSignedUrl(file.file_url, 3600);
                              if (signedUrl) {
                                window.open(signedUrl, '_blank');
                              } else {
                                if (showAlert) {
                                  showAlert('Unable to open file', 'error');
                                }
                              }
                            } catch (error) {
                              console.error('Error opening file:', error);
                              if (showAlert) {
                                showAlert('Failed to open file: ' + error.message, 'error');
                              }
                            }
                          }}
                          className="flex items-center gap-2 flex-1 min-w-0 text-left"
                        >
                          <PaperClipIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-blue-600 hover:text-blue-800 underline truncate">
                              {file.file_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(file.file_size / 1024).toFixed(1)} KB • Click to view
                            </p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.id)}
                          className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Remove file"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quote Summary */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5" />
                Quote Summary
              </h4>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="text-sm font-medium">${financials.subtotal.toFixed(2)}</span>
                  </div>

                  {/* Tax Detection Message */}
                  {taxDetectionInfo && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 text-lg">✓</span>
                        <div>
                          <p className="text-sm font-medium text-green-900">{taxDetectionInfo.message}</p>
                          <p className="text-xs text-green-700 mt-1">
                            Tax rate auto-detected from {taxDetectionInfo.source === 'service_address' ? 'service address' : 'customer location'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Discount Field */}
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-gray-600">Discount:</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.discount_total || ''}
                        onChange={(e) => setFormData({...formData, discount_total: e.target.value})}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Tax Rate Override Field */}
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-gray-600">Tax Rate (%):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.tax_rate !== undefined ? (formData.tax_rate * 100).toFixed(2) : (rates?.tax || 0)}
                        onChange={(e) => {
                          const percentValue = parseFloat(e.target.value) || 0;
                          setFormData({...formData, tax_rate: percentValue / 100});
                        }}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax ({rates?.tax || 0}%):</span>
                    <span className="text-sm font-medium">${financials.tax_total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-base font-medium text-gray-900">Total:</span>
                    <span className="text-base font-bold text-primary-600">${financials.grand_total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h5 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                  <CalculatorIcon className="w-4 h-4" />
                  Auto-Calculation Active
                </h5>
                <div className="space-y-1 text-sm text-green-800">
                  <div>• Labor: ${rates?.hourly || 0}/hr (Overtime: ${rates?.overtime || 0}/hr)</div>
                  <div>• Parts Markup: {rates?.markup || 0}%</div>
                  <div>• Tax Rate: {rates?.tax || 0}%</div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Quote Actions</h5>
                <div className="space-y-2 text-sm text-blue-800">
                  <div>• Save as Draft - Keep working on it</div>
                  <div>• Send Quote - Mark as sent to customer</div>
                  <div>• Accept/Reject - Update status based on customer response</div>
                  <div>• Convert to Job - Create job from accepted quote</div>
                </div>
              </div>
            </div>
          </div>

          {/* Labor Section - only for Time & Materials */}
          {formData.pricing_model === 'TIME_MATERIALS' && (
            <div className="mb-6">
              <LaborTable
                laborRows={laborRows}
                onLaborChange={setLaborRows}
                isEditable={true}
                showLegacyImport={isEdit && laborRows.length === 0}
                legacyData={laborService.checkLegacyLaborData(formData)}
                rates={rates}
              />
            </div>
          )}

          {/* Materials, Parts & Services - for Time & Materials and Unit-Based */}
          {(formData.pricing_model === 'TIME_MATERIALS' || formData.pricing_model === 'UNIT') && (formData.quote_items.filter(item => item.item_type !== 'labor').length > 0 ? (
            <div className="mb-6">
              <div className="mb-4">
                <h4 className="text-md font-medium text-gray-900">Materials, Parts & Services</h4>
              </div>

              {/* ✅ UX FIX: Show items list FIRST, then add buttons at bottom (no scrolling!) */}
              <div className="space-y-4">
                {formData.quote_items.map((item, actualIndex) => item.item_type !== 'labor' && (
                <div key={actualIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={item.item_type || 'material'}
                        onChange={(e) => updateQuoteItem(actualIndex, 'item_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="material">Materials/Parts</option>
                        <option value="equipment">Equipment</option>
                        <option value="service">Other Service</option>
                        <option value="permit">Permit/Fee</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        value={item.item_name}
                        onChange={(e) => updateQuoteItem(actualIndex, 'item_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Service or product name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={item.quantity}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty field while typing, otherwise parse as float
                          const numValue = value === '' ? 0 : parseFloat(value);
                          updateQuoteItem(actualIndex, 'quantity', numValue);
                        }}
                        onBlur={(e) => {
                          // Ensure minimum value of 0.1 when field loses focus
                          if (parseFloat(e.target.value) < 0.1) {
                            updateQuoteItem(actualIndex, 'quantity', 0.1);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter hours/quantity"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rate ($)
                        {item.item_type === 'labor' && item.is_overtime && ' (OT)'}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.rate}
                        onChange={(e) => {
                          const value = e.target.value;
                          // ✅ FIX: Allow empty field while typing, don't force to 0
                          const numValue = value === '' ? 0 : parseFloat(value);
                          updateQuoteItem(actualIndex, 'rate', numValue);
                        }}
                        onBlur={(e) => {
                          // Ensure minimum value of 0 when field loses focus
                          if (e.target.value === '' || parseFloat(e.target.value) < 0) {
                            updateQuoteItem(actualIndex, 'rate', 0);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total
                        {(item.item_type === 'material' || item.item_type === 'equipment') && ` (+${rates.markup}%)`}
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-medium">
                        ${calculateItemTotal(item).toFixed(2)}
                      </div>
                    </div>

                    {item.item_type === 'labor' && item.quantity > 8 && (
                      <div className="flex items-center pt-6">
                        <div className="text-sm text-orange-600 font-medium">
                          ⚠️ Overtime rate applied (>8 hours)
                        </div>
                      </div>
                    )}

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeQuoteItem(actualIndex)}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                        title="Remove item"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={item.description}
                        onChange={(e) => updateQuoteItem(actualIndex, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Additional details about this item..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Photo URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={item.photo_url}
                        onChange={(e) => updateQuoteItem(actualIndex, 'photo_url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="https://example.com/photo.jpg"
                      />
                    </div>
                  </div>

                  {item.quantity > 8 && (
                    <div className="mt-3 text-sm text-orange-600 font-medium">
                      ⚠️ Overtime rate applied (>8 hours)
                    </div>
                  )}
                </div>
              ))}
              </div>

              {/* ✅ UX FIX: Add buttons at BOTTOM so you don't have to scroll up after adding items */}
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={addQuoteItem}
                  className="btn-secondary flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowInventory(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add from Inventory
                </button>
                <button
                  type="button"
                  onClick={() => setShowComingSoonModal('library')}
                  className="btn-secondary flex items-center gap-2 relative"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add from Library
                  <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                    Coming Soon
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowComingSoonModal('cpq')}
                  className="btn-primary flex items-center gap-2 relative"
                >
                  <SparklesIcon className="w-4 h-4" />
                  Configure Package
                  <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                    Coming Soon
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 text-center py-6">
              <p className="text-gray-500 mb-3">No materials or parts needed?</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={addQuoteItem}
                  className="btn-secondary flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Materials/Parts
                </button>
                <button
                  type="button"
                  onClick={() => setShowInventory(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add from Inventory
                </button>
                <button
                  type="button"
                  onClick={() => setShowComingSoonModal('library')}
                  className="btn-secondary flex items-center gap-2 relative"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add from Library
                  <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                    Coming Soon
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowComingSoonModal('cpq')}
                  className="btn-primary flex items-center gap-2 relative"
                >
                  <SparklesIcon className="w-4 h-4" />
                  Configure Package
                  <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                    Coming Soon
                  </span>
                </button>
              </div>
            </div>
          ))}

          {/* Spacer for sticky footer */}
          <div className="h-24"></div>
        </form>

        {/* Sticky Action Buttons Footer */}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg mt-6 -mx-6 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Labor Entries: {laborRows.length} • Other Items: {formData.quote_items.filter(item => item.item_name.trim() && item.item_type !== 'labor').length}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>

              {isEdit ? (
                // Editing existing quote - industry standard actions
                <>
                  <button
                    type="submit"
                    form="quote-form"
                    className="btn-secondary"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSaveAndAction(e, 'pdf')}
                    className="btn-secondary flex items-center gap-2"
                    disabled={loading}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Save & Download PDF
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSaveAndAction(e, 'send')}
                    className="btn-primary flex items-center gap-2"
                    disabled={loading}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Save & Send to Customer
                  </button>
                </>
              ) : (
                // Creating new quote - industry standard actions
                <>
                  <button
                    type="submit"
                    form="quote-form"
                    className="btn-secondary"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSaveAndAction(e, 'send')}
                    className="btn-primary flex items-center gap-2"
                    disabled={loading}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Create & Send to Customer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Item Library Modal */}
      <ItemLibraryModal
        open={showLibrary}
        onClose={() => setShowLibrary(false)}
        onAdd={(item) => {
          const newItems = [...formData.quote_items, item];
          setFormData({ ...formData, quote_items: newItems });
          setShowLibrary(false);
        }}
      />

      {/* Inventory Items Modal */}
      <InventoryItemsModal
        open={showInventory}
        onClose={() => setShowInventory(false)}
        onAdd={(item) => {
          const newItem = {
            item_name: item.name,
            description: item.description || '',
            quantity: 1,
            rate: item.sell_price || item.cost || 0,
            item_type: 'material',
            is_overtime: false,
            photo_url: ''
          };
          const newItems = [...formData.quote_items, newItem];
          setFormData({ ...formData, quote_items: newItems });
          setShowInventory(false);
        }}
      />

      {/* Add Customer Modal */}
      <AddCustomerModal
        open={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        onCreated={(cust) => {
          // ✅ FIX: Add new customer to customers array so ServiceAddressSelector can find it
          if (setCustomers) {
            setCustomers([...customers, cust]);
          }
          setFormData({ ...formData, customer_id: cust.id, customer_query: cust.name || cust.full_name || '' });
          setShowAddCustomer(false);
        }}
      />

      {/* CPQ Builder Modal */}
      {showCPQ && (
        <CPQBuilder
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowCPQ(false)}
        />
      )}



      {/* Tools Modal */}
      {showTools && (
        <QuoteToolsModal
          isOpen={showTools}
          onClose={() => setShowTools(false)}
          toolPreferences={toolPreferences}
          onAddToQuote={addToolResultToQuote}
          keepOpen={keepToolsOpen}
          onKeepOpenChange={setKeepToolsOpen}
          currentQuoteId={formData?.id || null}
        />
      )}
      <ApprovalModal
        isOpen={activeModal === 'approved'}
        onClose={() => setActiveModal(null)}
        onConfirm={async (data) => {
          const updated = {
            ...formData,
            status: 'approved',
            customer_approved_at: `${data.approvalDate}T${data.approvalTime}:00`,
            approval_notes: data.notes || '',
            deposit_amount: data.depositAmount || null,
            deposit_method: data.depositMethod || null,
          };
          setFormData(updated);
          if (onSubmit) await onSubmit(null, { ...updated, skipInterceptors: true });
          // Smart Scheduling prompt/redirect (with safety flag)
          if (data.scheduleNow) {
            const qid = updated.id || formData.id;
            if (qid) {
              try { sessionStorage.setItem('openSmartSchedulingFor', qid); } catch (e) {}
              navigate(`/jobs?schedule=new&edit=${qid}`, { state: { openScheduler: true, jobId: qid } });
            } else {
              navigate(`/jobs?filter=unscheduled`);
            }
          } else {
            navigate(`/jobs?filter=unscheduled`);
          }
          setActiveModal(null);
        }}
        quoteTitle={formData?.title || ''}
        quoteAmount={(typeof calculateFinancialBreakdown === 'function' ? (calculateFinancialBreakdown()?.grand_total || 0) : 0)}
      />


      {/* ✅ Status modals (single state-driven) */}
      <PresentedModal
        isOpen={activeModal === 'presented'}
        onClose={() => setActiveModal(null)}
        onConfirm={async (data) => {
          const updated = {
            ...formData,
            status: 'presented',
            presented_date: data.presentedDate,
            presented_time: data.presentedTime,
            presented_by: data.presentedBy,
            customer_reaction: data.customerReaction,
            next_steps: data.nextSteps,
            presented_notes: data.notes,
          };
          setFormData(updated);
          if (onSubmit) await onSubmit(null, { ...updated, skipInterceptors: true });
          setActiveModal(null);
        }}
        quoteTitle={formData?.title || ''}
        customerName={(customers?.find(c => c.id === formData?.customer_id)?.name) || (customers?.find(c => c.id === formData?.customer_id)?.full_name) || ''}
      />

      <RejectionModal
        isOpen={activeModal === 'rejected'}
        onClose={() => setActiveModal(null)}
        onConfirm={async (data) => {
          const updated = {
            ...formData,
            status: 'rejected',
            rejection_reason: data.reason,
            rejection_competitor_name: data.competitorName,
            rejection_notes: data.notes,
          };
          setFormData(updated);
          if (onSubmit) await onSubmit(null, { ...updated, skipInterceptors: true });
          setActiveModal(null);
        }}
        quoteTitle={formData?.title || ''}
      />

      <ChangesRequestedModal
        isOpen={activeModal === 'changes'}
        onClose={() => setActiveModal(null)}
        onConfirm={async (data) => {
          console.log('🔄 ChangesRequestedModal onConfirm called with data:', data);
          const updated = {
            ...formData,
            status: 'changes_requested',
            change_types: data.changeTypes, // Array of change types
            change_details: data.changeDetails,
            change_urgency: data.urgency,
            change_follow_up_date: data.followUpDate,
          };
          console.log('🔄 Updated formData:', updated);
          console.log('🔄 Modal data fields:', {
            change_types: updated.change_types,
            change_details: updated.change_details,
            change_urgency: updated.change_urgency,
            change_follow_up_date: updated.change_follow_up_date
          });
          setFormData(updated);
          if (onSubmit) {
            console.log('🔄 Calling onSubmit with updated data...');
            const result = await onSubmit(null, { ...updated, skipInterceptors: true });
            console.log('✅ onSubmit result:', result);
          }
          setActiveModal(null);
        }}
        quoteTitle={formData?.title || ''}
      />

      <FollowUpModal
        isOpen={activeModal === 'followup'}
        onClose={() => setActiveModal(null)}
        onConfirm={async (data) => {
          const updated = {
            ...formData,
            status: 'follow_up',
            follow_up_date: data.followUpDate,
            follow_up_time: data.followUpTime,
            follow_up_method: data.followUpMethod,
            follow_up_reminder_time: data.reminderTime,
            follow_up_reason: data.reason,
            follow_up_notes: data.notes,
          };
          setFormData(updated);
          if (onSubmit) await onSubmit(null, { ...updated, skipInterceptors: true });
          setActiveModal(null);
        }}
        quoteTitle={formData?.title || ''}
        customerName={(customers?.find(c => c.id === formData?.customer_id)?.name) || (customers?.find(c => c.id === formData?.customer_id)?.full_name) || ''}
      />

      {/* Coming Soon Modal */}
      {showComingSoonModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {showComingSoonModal === 'library' ? (
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <PlusIcon className="w-6 h-6 text-blue-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <SparklesIcon className="w-6 h-6 text-purple-600" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {showComingSoonModal === 'library' ? 'Item Library' : 'Configure Package (CPQ)'}
                  </h3>
                  <span className="inline-block mt-1 px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">
                    Coming Soon
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowComingSoonModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {showComingSoonModal === 'library' ? (
                <>
                  <p className="text-gray-700">
                    <strong>Item Library</strong> will let you quickly add pre-configured items and services to your quotes.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">What it will do:</h4>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span><strong>Pre-configured catalog</strong> of your most common items, parts, and services</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span><strong>Default pricing</strong> automatically applied when you add items</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span><strong>Searchable by name, SKU, or category</strong> for quick access</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span><strong>Descriptions and photos</strong> included for professional quotes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span><strong>Manage your catalog</strong> in Settings → Item Library</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Database tables needed:</strong> <code className="bg-gray-100 px-2 py-1 rounded">items_catalog</code>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-700">
                    <strong>Configure Package (CPQ)</strong> will let you create professional service packages with tiered pricing and optional add-ons.
                  </p>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-2">What it will do:</h4>
                    <ul className="space-y-2 text-sm text-purple-800">
                      <li className="flex items-start gap-2">
                        <SparklesIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span><strong>Service bundles</strong> with Basic/Standard/Premium tiers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <SparklesIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span><strong>Optional add-ons</strong> customers can select (extended warranty, priority service, etc.)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <SparklesIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span><strong>Dynamic pricing</strong> that updates as customer selects options</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <SparklesIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span><strong>Visual package builder</strong> with side-by-side comparison</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <SparklesIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span><strong>Manage packages</strong> in Settings → Service Packages</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Database tables needed:</strong> <code className="bg-gray-100 px-2 py-1 rounded">service_bundles</code>, <code className="bg-gray-100 px-2 py-1 rounded">bundle_items</code>, <code className="bg-gray-100 px-2 py-1 rounded">bundle_options</code>
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowComingSoonModal(null)}
                className="btn-primary"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </>
  );
};

// Enhanced Tool Wrapper - Adds "Add to Quote" functionality to any tool
const ToolWithQuoteIntegration = ({ toolId, toolName, onAddToQuote, children }) => {
  // This will be enhanced to detect tool results and add "Add to Quote" buttons
  return (
    <div className="relative">
      {children}
      {/* TODO: Dynamically detect tool results and add "Add to Quote" buttons */}
    </div>
  );
};

// Quote Tools Modal Component - Uses actual Tools page components
const QuoteToolsModal = ({ isOpen, onClose, toolPreferences, onAddToQuote, keepOpen, onKeepOpenChange, currentQuoteId = null }) => {
  const [activeTab, setActiveTab] = useState(null);

  // Import the actual tool definitions from Tools page
  // This is a simplified approach - in production, we'd extract these to a shared module
  const tradeCategories = {
    general: {
      title: 'General Contractor',
      tools: [
        { id: 'area-coverage', title: 'Area & Coverage Calculator', component: 'AreaCoverageTool' },
        { id: 'roofing', title: 'Roofing Calculator', component: 'RoofingTool' },
        { id: 'materials', title: 'Materials Calculator', component: 'MaterialsTool' },
        { id: 'waste', title: 'Waste / Overage Calculator', component: 'WasteCalculatorTool' },
        { id: 'concrete', title: 'Concrete Volume', component: 'ConcreteTool' },
        { id: 'load-calculator', title: 'Load Calculator', component: 'LoadCalculatorTool' },
        { id: 'insulation', title: 'Insulation Calculator', component: 'InsulationTool' }
      ]
    },
    hvac: {
      title: 'HVAC',
      tools: [
        { id: 'hvac-cooling', title: 'Cooling Load Calculator', component: 'HVACCoolingTool' },
        { id: 'refrigerant-charge', title: 'Refrigerant Charge Calculator', component: 'RefrigerantChargeTool' },
        { id: 'duct-sizing', title: 'Duct Sizing Calculator', component: 'DuctSizingTool' },
        { id: 'heat-loss', title: 'Heat Loss Calculator', component: 'HeatLossCalculatorTool' },
        { id: 'lineset-charge', title: 'Lineset Charge Calculator', component: 'LinesetChargeTool' }
      ]
    },
    electrical: {
      title: 'Electrical',
      tools: [
        { id: 'electrical', title: 'Electrical Calculator', component: 'ElectricalTool' },
        { id: 'wire-size', title: 'Wire Size / Ampacity Calculator', component: 'WireSizeTool' },
        { id: 'conduit-fill', title: 'Conduit Fill Calculator', component: 'ConduitFillTool' },
        { id: 'breaker-sizing', title: 'Breaker Sizing Calculator', component: 'BreakerSizingTool' },
        { id: 'voltage-drop', title: 'Voltage Drop Calculator', component: 'VoltageDropTool' }
      ]
    },
    plumbing: {
      title: 'Plumbing',
      tools: [
        { id: 'pipe-volume', title: 'Pipe Volume Calculator', component: 'PipeVolumeTool' },
        { id: 'flow-pressure', title: 'Flow vs Pressure Drop Calculator', component: 'FlowPressureDropTool' },
        { id: 'fixture-units', title: 'Fixture Unit Load Calculator', component: 'FixtureUnitTool' }
      ]
    },
    roofing: {
      title: 'Roofing',
      tools: [
        { id: 'shingle-bundles', title: 'Shingle Bundle Calculator', component: 'ShingleBundleTool' }
      ]
    },
    flooring: {
      title: 'Flooring & Tile',
      tools: [
        { id: 'grout-thinset', title: 'Grout / Thinset Coverage Calculator', component: 'GroutThinsetTool' }
      ]
    },
    painting: {
      title: 'Painting',
      tools: [
        { id: 'paint-coverage', title: 'Paint Coverage Calculator', component: 'PaintCoverageTool' },
        { id: 'paint-cost', title: 'Paint Cost Estimator', component: 'PaintCostTool' }
      ]
    },
    landscaping: {
      title: 'Landscaping',
      tools: [
        { id: 'mulch-soil', title: 'Mulch / Soil Volume Calculator', component: 'MulchSoilTool' },
        { id: 'sod-seed', title: 'Sod / Grass Seed Calculator', component: 'SodSeedTool' }
      ]
    },
    utilities: {
      title: 'Universal Utilities',
      tools: [
        { id: 'unit-converter', title: 'Unit Converter', component: 'UnitConverterTool' }
      ]
    }
  };

  // Get all enabled tools across all categories
  const allEnabledTools = Object.values(tradeCategories)
    .flatMap(category => category.tools)
.filter(tool => toolPreferences[tool.id] !== false);

  // Set first enabled tool as default
  React.useEffect(() => {
    if (allEnabledTools.length > 0 && !activeTab) {
      setActiveTab(allEnabledTools[0].id);
    }
  }, [allEnabledTools, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Calculator Tools (Updated)</h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={keepOpen}
                onChange={(e) => onKeepOpenChange(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Keep open after adding
            </label>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {allEnabledTools.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CalculatorIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No calculator tools enabled.</p>
            <p className="text-sm mt-2">Enable tools in Operations → Tools → Manage Tools</p>
          </div>
        ) : (
          <ToolsContext.Provider value={{ targetQuoteId: currentQuoteId }}>
            <div className="flex h-[80vh]">
              {/* Tool Sidebar */}
              <div className="w-64 border-r bg-gray-50 overflow-y-auto">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Available Tools</h3>
                  <div className="space-y-1">
                    {allEnabledTools.map(tool => (
                      <button
                        key={tool.id}
                        onClick={() => setActiveTab(tool.id)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                          activeTab === tool.id
                            ? 'bg-blue-100 text-blue-900 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {tool.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tool Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {activeTab ? (
                    <ToolRenderer toolId={activeTab} />
                  ) : (
                    <div className="text-center text-gray-500 py-12">
                      <CalculatorIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Select a tool from the sidebar to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ToolsContext.Provider>
        )}
      </div>
    </div>
  );
};

// Tool Renderer Component - renders a real Tools.js component
const ToolRenderer = ({ toolId }) => {
  const ToolComponent = QuoteToolRegistry[toolId];
  console.log('ToolRenderer:', { toolId, hasComponent: !!ToolComponent, componentName: ToolComponent?.name });

  if (!ToolComponent) {
    return (
      <div className="max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700">Tool component not found for ID: {toolId}</p>
          <p className="text-sm text-red-600 mt-2">Available tools: {Object.keys(QuoteToolRegistry).join(', ')}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <ToolComponent />
      </div>
    </div>
  );
};

export default QuoteBuilder;
