import React, { useMemo, useState, useEffect, useContext, createContext } from 'react';
import PageHeader from '../components/Common/PageHeader';
import ModernPageHeader, { ModernStatCard, ModernActionButton } from '../components/Common/ModernPageHeader';
import ModernCard from '../components/Common/ModernCard';
import '../styles/modern-enhancements.css';
import { CheckCircleIcon, BuildingOfficeIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { supaFetch } from '../utils/supaFetch';
import { useUser } from '../contexts/UserContext';
import {
  BoltIcon,
  FireIcon,
  CubeIcon,
  CalculatorIcon,
  PaintBrushIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  ArrowsRightLeftIcon,
  BeakerIcon,

  Square3Stack3DIcon,
  SunIcon,
  CogIcon,
  XMarkIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

// Context to allow embedding Tools in Quote with a target quote id
export const ToolsContext = createContext({ targetQuoteId: null });
export const useToolsContext = () => useContext(ToolsContext);

// Accordion Panel Component
const AccordionPanel = ({ title, subtitle, icon: Icon, children, isExpanded, onToggle }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
    <button
      onClick={onToggle}
      className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />}
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {isExpanded ? (
        <ChevronDownIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
      ) : (
        <ChevronRightIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
      )}
    </button>
    {isExpanded && (
      <div className="border-t border-gray-200 p-4">
        {children}
      </div>
    )}
  </div>
);

// Legacy Card component for any remaining usage
const Card = ({ title, icon: Icon, children, subtitle }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {Icon && <Icon className="w-5 h-5 text-gray-400" />}
    </div>
    <div className="p-4">
      {children}
    </div>
  </div>
);

function Input({ label, value, onChange, suffix, type = 'number', min, step, placeholder }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="mt-1 relative">
        <input
          type={type}
          inputMode={type === 'number' ? 'decimal' : undefined}
          className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 pr-16"
          value={value}
          min={min}
          step={step}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {suffix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">{suffix}</span>
        )}
      </div>
    </label>
  );
}

const number = (n, d = 2) => (isFinite(n) ? Number(n).toFixed(d) : '--');

// Area & Coverage Calculator
function AreaCoverageTool() {
  // Updated: Fixed 2D vs 3D inputs and added SendToQuoteButton
  const [activeTab, setActiveTab] = useState('paint');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [coverageFactor, setCoverageFactor] = useState('350'); // sqft per gallon for paint
  const [directArea, setDirectArea] = useState('');
  const [useDirectArea, setUseDirectArea] = useState(false);

  const wallArea = useMemo(() => {
    if (useDirectArea) {
      return parseFloat(directArea) || 0;
    }
    const H = parseFloat(height) || 0;
    const P = 2 * ((parseFloat(length) || 0) + (parseFloat(width) || 0));
    return P * H; // perimeter × height
  }, [length, width, height, directArea, useDirectArea]);

  const floorArea = useMemo(() => {
    if (useDirectArea) {
      return parseFloat(directArea) || 0;
    }
    const L = parseFloat(length) || 0;
    const W = parseFloat(width) || 0;
    return L * W;
  }, [length, width, directArea, useDirectArea]);

  const result = useMemo(() => {
    const coverage = parseFloat(coverageFactor) || 1;
    switch (activeTab) {
      case 'paint':
        return { value: wallArea / coverage, unit: 'gallons', label: 'Paint Needed' };
      case 'drywall':
        const sheetSize = 32; // 4x8 sheet = 32 sqft
        return { value: Math.ceil(wallArea / sheetSize), unit: 'sheets', label: 'Drywall Sheets' };
      case 'flooring':
        return { value: floorArea, unit: 'sqft', label: 'Floor Area' };
      default:
        return { value: 0, unit: '', label: '' };
    }
  }, [activeTab, wallArea, floorArea, coverageFactor]);

  const quoteItem = useMemo(() => {
    switch (activeTab) {
      case 'paint':
        return {
          description: `Paint coverage - ${number(wallArea, 0)} sqft @ ${coverageFactor} sqft/gal`,
          quantity: Math.ceil(result.value),
          unit: 'gallons',
          unit_price: 0
        };
      case 'drywall':
        return {
          description: `Drywall - ${number(wallArea, 0)} sqft walls`,
          quantity: Math.ceil(result.value),
          unit: 'sheets',
          unit_price: 0
        };
      case 'flooring':
        return {
          description: `Flooring - ${number(floorArea, 0)} sqft`,
          quantity: Math.max(0, Math.round(result.value)),
          unit: 'sqft',
          unit_price: 0
        };
      default:
        return null;
    }
  }, [activeTab, result, wallArea, floorArea, coverageFactor]);

  return (
    <div>
      <div className="bg-green-100 border border-green-300 rounded p-2 mb-4 text-sm text-green-800">
        ✅ Updated: Fixed 2D vs 3D inputs and added Add to Quote button
      </div>
      {/* Tab Selector */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'paint', label: 'Paint' },
          { key: 'drywall', label: 'Drywall' },
          { key: 'flooring', label: 'Flooring' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Area Input Method Toggle */}
      <div className="flex items-center gap-3 mb-4">
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={useDirectArea}
            onChange={(e) => setUseDirectArea(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Enter area directly (sqft)
        </label>
      </div>

      {/* Inputs */}
      {useDirectArea ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label={activeTab === 'flooring' ? 'Floor Area' : 'Wall Area'}
            value={directArea}
            onChange={setDirectArea}
            suffix="sqft"
            placeholder="e.g., 400"
          />
        </div>
      ) : (
        <>
          {activeTab === 'flooring' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input label="Length" value={length} onChange={setLength} suffix="ft" placeholder="e.g., 12" />
              <Input label="Width" value={width} onChange={setWidth} suffix="ft" placeholder="e.g., 10" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input label="Room Length" value={length} onChange={setLength} suffix="ft" placeholder="e.g., 12" />
              <Input label="Room Width" value={width} onChange={setWidth} suffix="ft" placeholder="e.g., 10" />
              <Input label="Wall Height" value={height} onChange={setHeight} suffix="ft" placeholder="e.g., 9" />
            </div>
          )}
        </>
      )}

      {/* Coverage Factor for Paint */}
      {activeTab === 'paint' && (
        <div className="mb-4">
          <Input
            label="Coverage per Gallon"
            value={coverageFactor}
            onChange={setCoverageFactor}
            suffix="sqft/gal"
            placeholder="350"
          />
        </div>
      )}

      {/* Results */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-blue-700 mb-1">{result.label}</div>
        <div className="text-2xl font-bold text-blue-900">
          {number(result.value, activeTab === 'drywall' ? 0 : 1)} {result.unit}
        </div>
        {activeTab !== 'flooring' && (
          <div className="text-xs text-blue-600 mt-1">
            Wall area: {number(wallArea, 0)} sqft
          </div>
        )}
        {result.value > 0 && (
          <div className="mt-3">
            <SendToQuoteButton toolResult={quoteItem} toolName="Area & Coverage" />
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — rates are applied when used in Quotes.
      </p>
    </div>
  );
}

// Roofing Calculator
function RoofingTool() {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [pitch, setPitch] = useState('6/12');
  const [wastePercent, setWastePercent] = useState('10');

  const pitchMultiplier = useMemo(() => {
    const pitchMap = {
      '3/12': 1.03, '4/12': 1.06, '5/12': 1.10, '6/12': 1.12,
      '7/12': 1.16, '8/12': 1.20, '9/12': 1.25, '10/12': 1.30, '12/12': 1.41
    };
    return pitchMap[pitch] || 1.12;
  }, [pitch]);

  const adjustedSqft = useMemo(() => {
    const L = parseFloat(length) || 0;
    const W = parseFloat(width) || 0;
    const waste = 1 + (parseFloat(wastePercent) || 0) / 100;
    const baseSqft = L * W;
    return baseSqft * pitchMultiplier * waste;
  }, [length, width, pitchMultiplier, wastePercent]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input label="Roof Length" value={length} onChange={setLength} suffix="ft" placeholder="e.g., 40" />
        <Input label="Roof Width" value={width} onChange={setWidth} suffix="ft" placeholder="e.g., 30" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Roof Pitch</label>
          <select
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="3/12">3/12 (14°)</option>
            <option value="4/12">4/12 (18°)</option>
            <option value="5/12">5/12 (23°)</option>
            <option value="6/12">6/12 (27°)</option>
            <option value="7/12">7/12 (30°)</option>
            <option value="8/12">8/12 (34°)</option>
            <option value="9/12">9/12 (37°)</option>
            <option value="10/12">10/12 (40°)</option>
            <option value="12/12">12/12 (45°)</option>
          </select>
        </div>
        <Input label="Waste Factor" value={wastePercent} onChange={setWastePercent} suffix="%" placeholder="10" />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="text-sm text-green-700 mb-1">Adjusted Roof Area</div>
        <div className="text-2xl font-bold text-green-900">
          {number(adjustedSqft, 0)} sqft
        </div>
        <div className="text-xs text-green-600 mt-1">
          Base: {number((parseFloat(length) || 0) * (parseFloat(width) || 0), 0)} sqft × {pitchMultiplier} pitch × {1 + (parseFloat(wastePercent) || 0) / 100} waste
        </div>
        {adjustedSqft > 0 && (
          <div className="mt-3">
            <SendToQuoteButton
              toolResult={{
                description: `Roof area - ${number(adjustedSqft, 0)} sqft (pitch ${pitch}, waste ${wastePercent}%)`,
                quantity: Math.round(adjustedSqft),
                unit: 'sqft',
                unit_price: 0
              }}
              toolName="Roofing"
            />
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — rates are applied when used in Quotes.
      </p>
    </div>
  );
}

// Materials Calculator
function MaterialsTool() {
  const [activeTab, setActiveTab] = useState('concrete');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('4'); // inches for concrete
  const [wallLength, setWallLength] = useState('');
  const [studSpacing, setStudSpacing] = useState('16'); // inches

  const concreteYards = useMemo(() => {
    const L = parseFloat(length) || 0;
    const W = parseFloat(width) || 0;
    const D = parseFloat(depth) || 0;
    const cubicFeet = L * W * (D / 12); // convert inches to feet
    return cubicFeet / 27; // 27 cubic feet per yard
  }, [length, width, depth]);

  const studCount = useMemo(() => {
    const wallLengthFt = parseFloat(wallLength) || 0;
    const spacingInches = parseFloat(studSpacing) || 16;
    if (spacingInches <= 0) return 0;
    // Convert wall length to inches, divide by spacing, add 1 for end stud
    return Math.ceil((wallLengthFt * 12) / spacingInches) + 1;
  }, [wallLength, studSpacing]);

  return (
    <div>
      {/* Tab Selector */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'concrete', label: 'Concrete' },
          { key: 'framing', label: 'Framing' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-orange-100 text-orange-700 border border-orange-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'concrete' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input label="Length" value={length} onChange={setLength} suffix="ft" placeholder="e.g., 20" />
            <Input label="Width" value={width} onChange={setWidth} suffix="ft" placeholder="e.g., 15" />
            <Input label="Depth" value={depth} onChange={setDepth} suffix="in" placeholder="4" />
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-sm text-orange-700 mb-1">Concrete Needed</div>
            <div className="text-2xl font-bold text-orange-900">
              {number(concreteYards, 2)} cubic yards
            </div>
            <div className="text-xs text-orange-600 mt-1">
              Volume: {number((parseFloat(length) || 0) * (parseFloat(width) || 0) * (parseFloat(depth) || 0) / 12, 0)} cubic feet
            </div>
            {concreteYards > 0 && (
              <div className="mt-3">
                <SendToQuoteButton
                  toolResult={{
                    description: `Concrete - ${number(concreteYards, 2)} cubic yards`,
                    quantity: Math.ceil(concreteYards * 10) / 10, // Round to 0.1
                    unit: 'cubic yards',
                    unit_price: 0
                  }}
                  toolName="Materials Calculator"
                />
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input label="Wall Length" value={wallLength} onChange={setWallLength} suffix="ft" placeholder="e.g., 20" />
            <div>
              <label className="block text-sm text-gray-700 mb-1">Stud Spacing</label>
              <select
                value={studSpacing}
                onChange={(e) => setStudSpacing(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="12">12" O.C.</option>
                <option value="16">16" O.C.</option>
                <option value="24">24" O.C.</option>
              </select>
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-sm text-orange-700 mb-1">Studs Needed</div>
            <div className="text-2xl font-bold text-orange-900">
              {studCount} studs
            </div>
            <div className="text-xs text-orange-600 mt-1">
              {parseFloat(wallLength) || 0} ft wall @ {studSpacing}" spacing
            </div>
            {studCount > 0 && (
              <div className="mt-3">
                <SendToQuoteButton
                  toolResult={{
                    description: `Framing studs - ${parseFloat(wallLength) || 0}ft wall @ ${studSpacing}" O.C.`,
                    quantity: studCount,
                    unit: 'studs',
                    unit_price: 0
                  }}
                  toolName="Materials Calculator"
                />
              </div>
            )}
          </div>
        </>
      )}

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — rates are applied when used in Quotes.
      </p>
    </div>
  );
}

// Waste / Overage Calculator
function WasteCalculatorTool() {
  const [materialType, setMaterialType] = useState('flooring');
  const [baseAmount, setBaseAmount] = useState('');
  const [wastePercent, setWastePercent] = useState('10');

  // Default waste percentages by material type
  const defaultWasteByType = {
    flooring: 10,
    tile: 15,
    drywall: 10,
    other: 10
  };

  // Set default waste when material type changes
  const handleMaterialTypeChange = (type) => {
    setMaterialType(type);
    setWastePercent(defaultWasteByType[type].toString());
  };

  const calculations = useMemo(() => {
    const base = parseFloat(baseAmount) || 0;
    const waste = Math.min(25, Math.max(0, parseFloat(wastePercent) || 0)); // Clamp between 0-25%
    const wasteFactor = 1 + (waste / 100);
    const adjustedAmount = base * wasteFactor;
    const wasteAmount = adjustedAmount - base;

    return {
      base,
      waste,
      adjustedAmount,
      wasteAmount,
      wasteFactor
    };
  }, [baseAmount, wastePercent]);

  const materialTypeOptions = [
    { value: 'flooring', label: 'Flooring', typical: '10%' },
    { value: 'tile', label: 'Tile', typical: '15%' },
    { value: 'drywall', label: 'Drywall', typical: '10%' },
    { value: 'other', label: 'Other Materials', typical: '10%' }
  ];

  const getUnit = () => {
    switch (materialType) {
      case 'flooring':
      case 'tile':
        return 'sqft';
      case 'drywall':
        return 'sheets';
      default:
        return 'units';
    }
  };

  return (
    <div>
      <div className="space-y-4">
        {/* Material Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Material Type</label>
          <select
            value={materialType}
            onChange={(e) => handleMaterialTypeChange(e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            {materialTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} (typical: {option.typical})
              </option>
            ))}
          </select>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={`Base Material (${getUnit()})`}
            value={baseAmount}
            onChange={setBaseAmount}
            suffix={getUnit()}
            placeholder="e.g., 500"
          />
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Waste Percentage (0-25%)
            </label>
            <div className="mt-1 relative">
              <input
                type="number"
                min="0"
                max="25"
                step="0.5"
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 pr-8"
                value={wastePercent}
                onChange={(e) => {
                  const value = Math.min(25, Math.max(0, parseFloat(e.target.value) || 0));
                  setWastePercent(value.toString());
                }}
                placeholder="10"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">%</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-700 mb-1">Base Material</div>
            <div className="text-xl font-bold text-gray-900">
              {number(calculations.base, 0)} {getUnit()}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-700 mb-1">Waste Amount</div>
            <div className="text-xl font-bold text-yellow-900">
              +{number(calculations.wasteAmount, 0)} {getUnit()}
            </div>
            <div className="text-xs text-yellow-600 mt-1">
              {calculations.waste}% waste factor
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-700 mb-1">Total Needed</div>
            <div className="text-xl font-bold text-blue-900">
              {number(calculations.adjustedAmount, 0)} {getUnit()}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Base × {number(calculations.wasteFactor, 2)}
            </div>
            {calculations.adjustedAmount > 0 && (
              <div className="mt-3">
                <SendToQuoteButton
                  toolResult={{
                    description: `${materialType.charAt(0).toUpperCase() + materialType.slice(1)} with ${calculations.waste}% waste`,
                    quantity: Math.ceil(calculations.adjustedAmount),
                    unit: getUnit(),
                    unit_price: 0
                  }}
                  toolName="Waste Calculator"
                />
              </div>
            )}
          </div>
        </div>

        {/* Material-Specific Tips */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="text-sm text-amber-800">
            <strong>Tip:</strong> {getMaterialTip(materialType)}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — rates are applied when used in Quotes.
      </p>
    </div>
  );
}

// Helper function for material-specific tips
function getMaterialTip(materialType) {
  const tips = {
    flooring: 'Hardwood and laminate typically need 10% waste. Add extra for complex layouts or diagonal patterns.',
    tile: 'Ceramic and stone tiles need 15% waste due to cuts and breakage. Subway patterns may need less.',
    drywall: 'Standard rooms need 10% waste. Add more for rooms with many openings or angled cuts.',
    other: 'Waste factors vary by material. Consider cut complexity, breakage risk, and installation method.'
  };
  return tips[materialType] || tips.other;
}



// 3) HVAC cooling load (very rough estimate)
function HVACCoolingTool() {
  const [area, setArea] = useState('');
  const [btuPerSqFt, setBtuPerSqFt] = useState('25'); // typical rough range 20-30
  const btu = useMemo(() => {
    const a = parseFloat(area);
    const b = parseFloat(btuPerSqFt);
    if (!isFinite(a) || !isFinite(b)) return null;
    return a * b; // BTU/hr
  }, [area, btuPerSqFt]);
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Area" value={area} onChange={setArea} suffix="sq ft" placeholder="e.g., 1200" />
        <Input label="BTU per sq ft" value={btuPerSqFt} onChange={setBtuPerSqFt} suffix="BTU" />
        <div className="flex items-end">
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-xs text-gray-500">Estimated Load</div>
            <div className="text-lg font-semibold text-gray-900">{btu ? number(btu, 0) : '--'} BTU/hr</div>
            {btu && (
              <div className="mt-2">
                <SendToQuoteButton
                  toolResult={{
                    description: `HVAC cooling load - ${area} sqft`,
                    quantity: 1,
                    unit: 'system',
                    unit_price: 0
                  }}
                  toolName="HVAC Cooling Load Calculator"
                  className="text-xs px-2 py-1"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-3">Disclaimer: For design sizing use industry-standard calculations (Manual J). This tool provides a quick rough estimate only.</p>
    </div>
  );
}

// 4) Concrete volume
function ConcreteTool() {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');
  const cubicYards = useMemo(() => {
    const L = parseFloat(length);
    const W = parseFloat(width);
    const D = parseFloat(depth); // inches
    if (!isFinite(L) || !isFinite(W) || !isFinite(D)) return null;
    const cubicFeet = (L * W * (D / 12));
    return cubicFeet / 27; // 27 cubic ft per yard
  }, [length, width, depth]);
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input label="Length" value={length} onChange={setLength} suffix="ft" />
        <Input label="Width" value={width} onChange={setWidth} suffix="ft" />
        <Input label="Depth" value={depth} onChange={setDepth} suffix="in" />
        <div className="flex items-end">
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-xs text-gray-500">Cubic Yards</div>
            <div className="text-lg font-semibold text-gray-900">{cubicYards ? number(cubicYards, 2) : '--'} yd³</div>
            {cubicYards > 0 && (
              <div className="mt-2">
                <SendToQuoteButton
                  toolResult={{
                    description: `Concrete volume - ${number(cubicYards, 2)} cubic yards`,
                    quantity: Math.ceil(cubicYards * 10) / 10,
                    unit: 'cubic yards',
                    unit_price: 0
                  }}
                  toolName="Concrete Volume"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 5) Electrical VA/Watts/Amps/Volts
function ElectricalTool() {
  const [volts, setVolts] = useState('');
  const [amps, setAmps] = useState('');
  const [watts, setWatts] = useState('');
  const solve = useMemo(() => {
    const V = parseFloat(volts);
    const A = parseFloat(amps);
    const W = parseFloat(watts);
    if (isFinite(V) && isFinite(A)) return { V, A, W: V * A };
    if (isFinite(W) && isFinite(V)) return { V, A: W / V, W };
    if (isFinite(W) && isFinite(A)) return { V: W / A, A, W };
    return null;
  }, [volts, amps, watts]);
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input label="Volts" value={volts} onChange={setVolts} suffix="V" />
        <Input label="Amps" value={amps} onChange={setAmps} suffix="A" />
        <Input label="Watts" value={watts} onChange={setWatts} suffix="W" />
        <div className="flex items-end">
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-xs text-gray-500">Result</div>
            <div className="text-sm text-gray-900">
              {solve ? `${number(solve.V, 1)} V • ${number(solve.A, 2)} A • ${number(solve.W, 0)} W` : '--'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Unit Converter Tool
function UnitConverterTool() {
  const [activeTab, setActiveTab] = useState('length');
  const [fromValue, setFromValue] = useState('');
  const [fromUnit, setFromUnit] = useState('ft');
  const [toUnit, setToUnit] = useState('in');

  const conversions = {
    length: {
      units: { ft: 'Feet', in: 'Inches', yd: 'Yards', m: 'Meters', cm: 'Centimeters' },
      toBase: { ft: 1, in: 1/12, yd: 3, m: 3.28084, cm: 0.0328084 },
    },
    area: {
      units: { sqft: 'Sq Feet', sqin: 'Sq Inches', sqyd: 'Sq Yards', sqm: 'Sq Meters' },
      toBase: { sqft: 1, sqin: 1/144, sqyd: 9, sqm: 10.7639 },
    },
    volume: {
      units: { cuft: 'Cubic Feet', cuin: 'Cubic Inches', cuyd: 'Cubic Yards', gal: 'Gallons', l: 'Liters' },
      toBase: { cuft: 1, cuin: 1/1728, cuyd: 27, gal: 0.133681, l: 0.0353147 },
    }
  };

  const convertedValue = useMemo(() => {
    const input = parseFloat(fromValue) || 0;
    const conv = conversions[activeTab];
    if (!conv) return 0;

    const baseValue = input * conv.toBase[fromUnit];
    return baseValue / conv.toBase[toUnit];
  }, [fromValue, fromUnit, toUnit, activeTab]);

  const currentConversion = conversions[activeTab];

  return (
    <div>
      {/* Tab Selector */}
      <div className="flex gap-2 mb-4">
        {Object.keys(conversions).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setFromUnit(Object.keys(conversions[tab].units)[0]);
              setToUnit(Object.keys(conversions[tab].units)[1]);
            }}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">From</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={fromValue}
              onChange={(e) => setFromValue(e.target.value)}
              className="flex-1 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter value"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(currentConversion.units).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">To</label>
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-medium">
              {number(convertedValue, 4)}
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(currentConversion.units).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="text-sm text-indigo-700 mb-1">Conversion Result</div>
        <div className="text-xl font-bold text-indigo-900">
          {fromValue || '0'} {currentConversion.units[fromUnit]} = {number(convertedValue, 4)} {currentConversion.units[toUnit]}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — rates are applied when used in Quotes.
      </p>
    </div>
  );
}



// Load Calculator
function LoadCalculatorTool() {
  const [loadType, setLoadType] = useState('floor');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [loadPSF, setLoadPSF] = useState('40'); // pounds per square foot

  const loadTypes = {
    floor: { label: 'Floor Load', typical: 40, unit: 'psf' },
    roof: { label: 'Roof Load', typical: 20, unit: 'psf' },
    snow: { label: 'Snow Load', typical: 30, unit: 'psf' },
    wind: { label: 'Wind Load', typical: 15, unit: 'psf' }
  };

  const area = useMemo(() => {
    const L = parseFloat(length) || 0;
    const W = parseFloat(width) || 0;
    return L * W;
  }, [length, width]);

  const totalLoad = useMemo(() => {
    const load = parseFloat(loadPSF) || 0;
    return area * load;
  }, [area, loadPSF]);

  const handleLoadTypeChange = (type) => {
    setLoadType(type);
    setLoadPSF(loadTypes[type].typical.toString());
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Load Type</label>
          <select
            value={loadType}
            onChange={(e) => handleLoadTypeChange(e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.entries(loadTypes).map(([key, type]) => (
              <option key={key} value={key}>{type.label} (typical: {type.typical} {type.unit})</option>
            ))}
          </select>
        </div>

        <Input
          label="Load (PSF)"
          value={loadPSF}
          onChange={setLoadPSF}
          suffix="psf"
          placeholder="40"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input label="Length" value={length} onChange={setLength} suffix="ft" placeholder="e.g., 20" />
        <Input label="Width" value={width} onChange={setWidth} suffix="ft" placeholder="e.g., 15" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-700 mb-1">Area</div>
          <div className="text-xl font-bold text-gray-900">
            {number(area, 0)} sqft
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-700 mb-1">Load per Sq Ft</div>
          <div className="text-xl font-bold text-red-900">
            {loadPSF} psf
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-700 mb-1">Total Load</div>
          <div className="text-xl font-bold text-red-900">
            {number(totalLoad, 0)} lbs
          </div>
          {totalLoad > 0 && (
            <div className="mt-3">
              <SendToQuoteButton
                toolResult={{
                  description: `${loadTypes[loadType].label} - ${number(area, 0)} sqft @ ${loadPSF} psf`,
                  quantity: Math.round(totalLoad),
                  unit: 'lbs',
                  unit_price: 0
                }}
                toolName="Load Calculator"
              />
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        ⚠️ For structural calculations, consult a licensed engineer. This is for planning only.
      </p>
    </div>
  );
}

// Insulation Calculator
function InsulationTool() {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [studSpacing, setStudSpacing] = useState('16');
  const [rValue, setRValue] = useState('13'); // R-13 typical for 2x4 walls

  const area = useMemo(() => {
    const L = parseFloat(length) || 0;
    const W = parseFloat(width) || 0;
    return L * W;
  }, [length, width]);

  const batts = useMemo(() => {
    const spacing = parseFloat(studSpacing) || 16;
    const wallLength = parseFloat(length) || 0;
    const wallHeight = parseFloat(width) || 0; // using width as height for wall calc

    if (spacing <= 0 || wallLength <= 0) return 0;

    // Number of stud bays = (length in inches / spacing)
    const studBays = Math.ceil((wallLength * 12) / spacing);
    // Each batt covers one bay for the full height
    return studBays;
  }, [length, width, studSpacing]);

  const rValueOptions = [
    { value: '11', label: 'R-11 (2x4 walls)' },
    { value: '13', label: 'R-13 (2x4 walls)' },
    { value: '15', label: 'R-15 (2x4 walls)' },
    { value: '19', label: 'R-19 (2x6 walls)' },
    { value: '21', label: 'R-21 (2x6 walls)' },
    { value: '30', label: 'R-30 (attic)' },
    { value: '38', label: 'R-38 (attic)' },
    { value: '49', label: 'R-49 (attic)' }
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input label="Wall Length" value={length} onChange={setLength} suffix="ft" placeholder="e.g., 20" />
        <Input label="Wall Height" value={width} onChange={setWidth} suffix="ft" placeholder="e.g., 9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Stud Spacing</label>
          <select
            value={studSpacing}
            onChange={(e) => setStudSpacing(e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="16">16" O.C.</option>
            <option value="24">24" O.C.</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">R-Value</label>
          <select
            value={rValue}
            onChange={(e) => setRValue(e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            {rValueOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-700 mb-1">Wall Area</div>
          <div className="text-xl font-bold text-blue-900">
            {number(area, 0)} sqft
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-700 mb-1">Insulation Batts</div>
          <div className="text-xl font-bold text-green-900">
            {batts} batts
          </div>
          <div className="text-xs text-green-600 mt-1">R-{rValue} @ {studSpacing}" O.C.</div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-700 mb-1">Coverage</div>
          <div className="text-xl font-bold text-purple-900">
            {number(area, 0)} sqft
          </div>
          <div className="text-xs text-purple-600 mt-1">Total coverage</div>
          {batts > 0 && (
            <div className="mt-3">
              <SendToQuoteButton
                toolResult={{
                  description: `Insulation batts R-${rValue} - ${number(area, 0)} sqft @ ${studSpacing}" O.C.`,
                  quantity: batts,
                  unit: 'batts',
                  unit_price: 0
                }}
                toolName="Insulation Calculator"
              />
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — verify local energy codes and requirements.
      </p>
    </div>
  );
}

// HVAC Refrigerant Charge Calculator
function RefrigerantChargeTool() {
  const [wetBulb, setWetBulb] = useState('');
  const [dryBulb, setDryBulb] = useState('');
  const [suctionTemp, setSuctionTemp] = useState('');
  const [liquidTemp, setLiquidTemp] = useState('');

  // Calculate target superheat based on wet-bulb and dry-bulb temperatures
  const targetSuperheat = useMemo(() => {
    const wb = parseFloat(wetBulb) || 0;
    const db = parseFloat(dryBulb) || 0;

    if (wb <= 0 || db <= 0) return 0;

    // Simplified superheat calculation based on industry standards
    // Target superheat = (Outdoor temp - Indoor wet-bulb) / 2.2 + base superheat
    const tempDiff = db - wb;
    const baseSuperheat = 8; // Base superheat for typical systems
    return Math.max(6, Math.min(14, baseSuperheat + (tempDiff / 2.2)));
  }, [wetBulb, dryBulb]);

  // Calculate actual superheat (suction line temp - evaporator saturation temp)
  // For simplification, we'll estimate saturation temp based on typical pressures
  const actualSuperheat = useMemo(() => {
    const suction = parseFloat(suctionTemp) || 0;
    const wb = parseFloat(wetBulb) || 0;

    if (suction <= 0 || wb <= 0) return 0;

    // Estimate evaporator saturation temperature (simplified)
    // Typically 35-45°F for residential systems
    const estimatedSatTemp = wb - 25; // Rough approximation
    return suction - estimatedSatTemp;
  }, [suctionTemp, wetBulb]);

  const difference = useMemo(() => actualSuperheat - targetSuperheat, [actualSuperheat, targetSuperheat]);

  const getGuidance = () => {
    if (Math.abs(difference) <= 2) {
      return { text: 'Charge OK', color: 'green', bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-900' };
    } else if (difference > 2) {
      return { text: 'Add Refrigerant', color: 'blue', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-900' };
    } else {
      return { text: 'Remove Refrigerant', color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-900' };
    }
  };

  const guidance = getGuidance();

  // Calculate subcooling for additional reference
  const subcooling = useMemo(() => {
    const liquid = parseFloat(liquidTemp) || 0;
    const db = parseFloat(dryBulb) || 0;

    if (liquid <= 0 || db <= 0) return 0;

    // Estimate condensing temperature (simplified)
    const estimatedCondTemp = db + 20; // Rough approximation
    return estimatedCondTemp - liquid;
  }, [liquidTemp, dryBulb]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input
          label="Indoor Wet-Bulb Temp"
          value={wetBulb}
          onChange={setWetBulb}
          suffix="°F"
          placeholder="e.g., 67"
        />
        <Input
          label="Outdoor Dry-Bulb Temp"
          value={dryBulb}
          onChange={setDryBulb}
          suffix="°F"
          placeholder="e.g., 95"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input
          label="Suction Line Temp"
          value={suctionTemp}
          onChange={setSuctionTemp}
          suffix="°F"
          placeholder="e.g., 55"
        />
        <Input
          label="Liquid Line Temp"
          value={liquidTemp}
          onChange={setLiquidTemp}
          suffix="°F"
          placeholder="e.g., 100"
        />
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-700 mb-1">Target Superheat</div>
          <div className="text-xl font-bold text-gray-900">
            {number(targetSuperheat, 1)}°F
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Based on conditions
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-700 mb-1">Actual Superheat</div>
          <div className="text-xl font-bold text-blue-900">
            {number(actualSuperheat, 1)}°F
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Calculated from readings
          </div>
        </div>
      </div>

      {/* Guidance */}
      <div className={`${guidance.bgColor} ${guidance.borderColor} border rounded-lg p-4 mb-4`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-700 mb-1">Recommendation</div>
            <div className={`text-xl font-bold ${guidance.textColor}`}>
              {guidance.text}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Difference: {difference > 0 ? '+' : ''}{number(difference, 1)}°F
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-700 mb-1">Subcooling</div>
            <div className="text-lg font-semibold text-gray-900">
              {number(subcooling, 1)}°F
            </div>
            <div className="text-xs text-gray-600">
              (Reference)
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
        <div className="text-sm text-amber-800">
          <strong>Quick Reference:</strong>
          <ul className="mt-1 text-xs space-y-1">
            <li>• Target superheat: 6-14°F (varies by conditions)</li>
            <li>• Subcooling: typically 8-12°F for most systems</li>
            <li>• ±2°F tolerance is generally acceptable</li>
          </ul>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — use proper gauges and manufacturer charts for precise charging.
      </p>
    </div>
  );
}

// HVAC Duct Sizing Calculator
function DuctSizingTool() {
  const [airflow, setAirflow] = useState('');
  const [velocity, setVelocity] = useState('700');
  const [ductShape, setDuctShape] = useState('round');

  const roundDiameter = useMemo(() => {
    const cfm = parseFloat(airflow) || 0;
    const fpm = parseFloat(velocity) || 700;

    if (cfm <= 0 || fpm <= 0) return 0;

    // Formula: Area = CFM / FPM, then Diameter = sqrt(Area / 0.7854) * 2
    const area = cfm / fpm; // sq ft
    const areaInches = area * 144; // convert to sq inches
    const diameter = Math.sqrt(areaInches / 0.7854);

    return diameter;
  }, [airflow, velocity]);

  const rectangularDimensions = useMemo(() => {
    const cfm = parseFloat(airflow) || 0;
    const fpm = parseFloat(velocity) || 700;

    if (cfm <= 0 || fpm <= 0) return { width: 0, height: 0 };

    const area = cfm / fpm; // sq ft
    const areaInches = area * 144; // convert to sq inches

    // Common aspect ratios for rectangular ducts
    const aspectRatio = 2; // width:height = 2:1
    const height = Math.sqrt(areaInches / aspectRatio);
    const width = height * aspectRatio;

    return { width: Math.round(width), height: Math.round(height) };
  }, [airflow, velocity]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Input
          label="Airflow (CFM)"
          value={airflow}
          onChange={setAirflow}
          suffix="CFM"
          placeholder="e.g., 1000"
        />
        <Input
          label="Target Velocity"
          value={velocity}
          onChange={setVelocity}
          suffix="FPM"
          placeholder="700"
        />
        <div>
          <label className="block text-sm text-gray-700 mb-1">Duct Shape</label>
          <select
            value={ductShape}
            onChange={(e) => setDuctShape(e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="round">Round Duct</option>
            <option value="rectangular">Rectangular Duct</option>
          </select>
        </div>
      </div>

      {ductShape === 'round' ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-700 mb-1">Recommended Round Duct</div>
          <div className="text-2xl font-bold text-blue-900">
            {number(roundDiameter, 1)}" diameter
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Area: {number((Math.PI * Math.pow(roundDiameter/2, 2)), 1)} sq in
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-700 mb-1">Recommended Rectangular Duct</div>
          <div className="text-2xl font-bold text-green-900">
            {rectangularDimensions.width}" × {rectangularDimensions.height}"
          </div>
          <div className="text-xs text-green-600 mt-1">
            Area: {number((rectangularDimensions.width * rectangularDimensions.height), 1)} sq in
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
        <div className="text-sm text-amber-800">
          <strong>Velocity Guidelines:</strong>
          <ul className="mt-1 text-xs space-y-1">
            <li>• Supply ducts: 600-900 FPM</li>
            <li>• Return ducts: 500-700 FPM</li>
            <li>• Main trunks: 800-1200 FPM</li>
          </ul>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — verify with ACCA Manual D or manufacturer data.
      </p>
    </div>
  );
}

// HVAC Heat Loss Calculator
function HeatLossCalculatorTool() {
  const [area, setArea] = useState('');
  const [insulation, setInsulation] = useState('average');
  const [outdoorTemp, setOutdoorTemp] = useState('');
  const [indoorTemp, setIndoorTemp] = useState('70');

  const insulationMultipliers = {
    poor: { value: 25, label: 'Poor (25 BTU/sqft/ΔT)' },
    average: { value: 20, label: 'Average (20 BTU/sqft/ΔT)' },
    good: { value: 15, label: 'Good (15 BTU/sqft/ΔT)' },
    excellent: { value: 10, label: 'Excellent (10 BTU/sqft/ΔT)' }
  };

  const deltaT = useMemo(() => {
    const indoor = parseFloat(indoorTemp) || 70;
    const outdoor = parseFloat(outdoorTemp) || 0;
    return Math.abs(indoor - outdoor);
  }, [indoorTemp, outdoorTemp]);

  const heatingLoad = useMemo(() => {
    const sqft = parseFloat(area) || 0;
    const multiplier = insulationMultipliers[insulation]?.value || 20;
    return sqft * multiplier * deltaT;
  }, [area, insulation, deltaT]);

  const tons = useMemo(() => heatingLoad / 12000, [heatingLoad]); // 12,000 BTU/hr = 1 ton

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input
          label="Area"
          value={area}
          onChange={setArea}
          suffix="sqft"
          placeholder="e.g., 1000"
        />
        <div>
          <label className="block text-sm text-gray-700 mb-1">Insulation Quality</label>
          <select
            value={insulation}
            onChange={(e) => setInsulation(e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.entries(insulationMultipliers).map(([key, item]) => (
              <option key={key} value={key}>{item.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input
          label="Outdoor Design Temp"
          value={outdoorTemp}
          onChange={setOutdoorTemp}
          suffix="°F"
          placeholder="e.g., 30"
        />
        <Input
          label="Indoor Design Temp"
          value={indoorTemp}
          onChange={setIndoorTemp}
          suffix="°F"
          placeholder="70"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm text-orange-700 mb-1">Temperature Difference</div>
          <div className="text-xl font-bold text-orange-900">
            {number(deltaT, 0)}°F
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-700 mb-1">Heating Load</div>
          <div className="text-xl font-bold text-red-900">
            {number(heatingLoad, 0)} BTU/hr
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-700 mb-1">Equivalent Tonnage</div>
          <div className="text-xl font-bold text-purple-900">
            {number(tons, 1)} tons
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — verify with Manual J heating load calculations.
      </p>
    </div>
  );
}

// Lineset Refrigerant Charge Calculator
function LinesetChargeTool() {
  const [linesetLength, setLinesetLength] = useState('');
  const [preCharge, setPreCharge] = useState('15');
  const [ozPerFoot, setOzPerFoot] = useState('0.6');

  const additionalLength = useMemo(() => {
    const total = parseFloat(linesetLength) || 0;
    const pre = parseFloat(preCharge) || 0;
    return Math.max(0, total - pre);
  }, [linesetLength, preCharge]);

  const additionalOunces = useMemo(() => {
    const length = additionalLength;
    const rate = parseFloat(ozPerFoot) || 0.6;
    return length * rate;
  }, [additionalLength, ozPerFoot]);

  const additionalPounds = useMemo(() => additionalOunces / 16, [additionalOunces]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Input
          label="Total Lineset Length"
          value={linesetLength}
          onChange={setLinesetLength}
          suffix="ft"
          placeholder="e.g., 50"
        />
        <Input
          label="Factory Pre-Charge"
          value={preCharge}
          onChange={setPreCharge}
          suffix="ft"
          placeholder="15"
        />
        <Input
          label="Refrigerant per Foot"
          value={ozPerFoot}
          onChange={setOzPerFoot}
          suffix="oz/ft"
          placeholder="0.6"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-700 mb-1">Additional Length</div>
          <div className="text-xl font-bold text-blue-900">
            {number(additionalLength, 0)} ft
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Beyond factory pre-charge
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-700 mb-1">Additional Refrigerant</div>
          <div className="text-xl font-bold text-green-900">
            {number(additionalOunces, 1)} oz
          </div>
          <div className="text-xs text-green-600 mt-1">
            Ounces needed
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-700 mb-1">In Pounds</div>
          <div className="text-xl font-bold text-purple-900">
            {number(additionalPounds, 2)} lbs
          </div>
          <div className="text-xs text-purple-600 mt-1">
            {additionalOunces > 0 ? `${number(additionalOunces, 1)} oz` : '0 oz'}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
        <div className="text-sm text-amber-800">
          <strong>Common Rates:</strong>
          <ul className="mt-1 text-xs space-y-1">
            <li>• 3/8" liquid line: ~0.3 oz/ft</li>
            <li>• 1/2" liquid line: ~0.6 oz/ft</li>
            <li>• 5/8" liquid line: ~0.9 oz/ft</li>
          </ul>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — always verify with manufacturer specifications.
      </p>
    </div>
  );
}

// Wire Size / Ampacity Calculator
function WireSizeTool() {
  const [loadCurrent, setLoadCurrent] = useState('');
  const [material, setMaterial] = useState('copper');
  const [distance, setDistance] = useState('');

  // Simplified NEC ampacity tables (75°C termination)
  const ampacityTable = {
    copper: {
      '14': 20, '12': 25, '10': 35, '8': 50, '6': 65, '4': 85, '3': 100, '2': 115,
      '1': 130, '1/0': 150, '2/0': 175, '3/0': 200, '4/0': 230, '250': 255, '300': 285
    },
    aluminum: {
      '12': 20, '10': 30, '8': 40, '6': 50, '4': 65, '3': 75, '2': 90,
      '1': 100, '1/0': 120, '2/0': 135, '3/0': 155, '4/0': 180, '250': 205, '300': 230
    }
  };

  const wireGauges = ['14', '12', '10', '8', '6', '4', '3', '2', '1', '1/0', '2/0', '3/0', '4/0', '250', '300'];

  const recommendedWire = useMemo(() => {
    const current = parseFloat(loadCurrent) || 0;
    if (current <= 0) return null;

    const table = ampacityTable[material];
    for (const gauge of wireGauges) {
      if (table[gauge] >= current) {
        return { gauge, ampacity: table[gauge] };
      }
    }
    return { gauge: '300+', ampacity: 'Consult NEC' };
  }, [loadCurrent, material]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Input
          label="Load Current"
          value={loadCurrent}
          onChange={setLoadCurrent}
          suffix="amps"
          placeholder="e.g., 30"
        />
        <div>
          <label className="block text-sm text-gray-700 mb-1">Conductor Material</label>
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="copper">Copper</option>
            <option value="aluminum">Aluminum</option>
          </select>
        </div>
        <Input
          label="Distance (optional)"
          value={distance}
          onChange={setDistance}
          suffix="ft"
          placeholder="e.g., 100"
        />
      </div>

      {recommendedWire && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-700 mb-1">Recommended Wire Size</div>
          <div className="text-2xl font-bold text-blue-900">
            {recommendedWire.gauge} AWG {material}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Ampacity: {recommendedWire.ampacity} amps (75°C termination)
          </div>
          <div className="mt-3">
            <SendToQuoteButton
              toolResult={{
                description: `${recommendedWire.gauge} AWG ${material} wire - ${loadCurrent}A load${distance ? ` (${distance}ft)` : ''}`,
                quantity: parseFloat(distance) || 100,
                unit: 'ft',
                unit_price: 0
              }}
              toolName="Wire Size Calculator"
            />
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — verify with NEC ampacity tables.
      </p>
    </div>
  );
}

// Conduit Fill Calculator
function ConduitFillTool() {
  const [conduitSize, setConduitSize] = useState('1');
  const [wireGauge, setWireGauge] = useState('12');
  const [conductorCount, setConductorCount] = useState('');

  // Conduit areas (sq in) - simplified common sizes
  const conduitAreas = {
    '0.5': 0.304, '0.75': 0.533, '1': 0.864, '1.25': 1.496, '1.5': 2.036, '2': 3.356
  };

  // Wire areas (sq in) including insulation - simplified
  const wireAreas = {
    '14': 0.0097, '12': 0.0133, '10': 0.0211, '8': 0.0366, '6': 0.0507,
    '4': 0.0824, '3': 0.0973, '2': 0.1158, '1': 0.1562, '1/0': 0.1855
  };

  const fillPercentage = useMemo(() => {
    const count = parseFloat(conductorCount) || 0;
    const wireArea = wireAreas[wireGauge] || 0;
    const conduitArea = conduitAreas[conduitSize] || 1;

    if (count <= 0) return 0;
    return (wireArea * count / conduitArea) * 100;
  }, [conduitSize, wireGauge, conductorCount]);

  const necLimit = parseFloat(conductorCount) > 2 ? 40 : 53; // NEC limits
  const passesNEC = fillPercentage <= necLimit;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Conduit Size</label>
          <select
            value={conduitSize}
            onChange={(e) => setConduitSize(e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="0.5">½"</option>
            <option value="0.75">¾"</option>
            <option value="1">1"</option>
            <option value="1.25">1¼"</option>
            <option value="1.5">1½"</option>
            <option value="2">2"</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Wire Gauge</label>
          <select
            value={wireGauge}
            onChange={(e) => setWireGauge(e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.keys(wireAreas).map(gauge => (
              <option key={gauge} value={gauge}>{gauge} AWG</option>
            ))}
          </select>
        </div>
        <Input
          label="Number of Conductors"
          value={conductorCount}
          onChange={setConductorCount}
          suffix="wires"
          placeholder="e.g., 3"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-700 mb-1">Conduit Fill</div>
          <div className="text-2xl font-bold text-gray-900">
            {number(fillPercentage, 1)}%
          </div>
          <div className="text-xs text-gray-600 mt-1">
            NEC Limit: {necLimit}%
          </div>
        </div>

        <div className={`${passesNEC ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
          <div className={`text-sm ${passesNEC ? 'text-green-700' : 'text-red-700'} mb-1`}>NEC Compliance</div>
          <div className={`text-2xl font-bold ${passesNEC ? 'text-green-900' : 'text-red-900'}`}>
            {passesNEC ? 'PASS' : 'FAIL'}
          </div>
          <div className={`text-xs ${passesNEC ? 'text-green-600' : 'text-red-600'} mt-1`}>
            {passesNEC ? 'Within limits' : 'Exceeds NEC limit'}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — verify with NEC conduit fill tables.
      </p>
    </div>
  );
}

// Breaker Sizing Calculator
function BreakerSizingTool() {
  const [loadCurrent, setLoadCurrent] = useState('');
  const [loadType, setLoadType] = useState('continuous');

  // Standard breaker sizes
  const standardBreakers = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200, 225, 250];

  const calculatedSize = useMemo(() => {
    const current = parseFloat(loadCurrent) || 0;
    if (current <= 0) return 0;

    const multiplier = loadType === 'continuous' ? 1.25 : 1.0;
    return current * multiplier;
  }, [loadCurrent, loadType]);

  const recommendedBreaker = useMemo(() => {
    if (calculatedSize <= 0) return null;

    const nextSize = standardBreakers.find(size => size >= calculatedSize);
    return nextSize || 'Consult electrician';
  }, [calculatedSize]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input
          label="Load Current"
          value={loadCurrent}
          onChange={setLoadCurrent}
          suffix="amps"
          placeholder="e.g., 16"
        />
        <div>
          <label className="block text-sm text-gray-700 mb-1">Load Type</label>
          <select
            value={loadType}
            onChange={(e) => setLoadType(e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="continuous">Continuous (3+ hours)</option>
            <option value="non-continuous">Non-continuous</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm text-orange-700 mb-1">Calculated Size</div>
          <div className="text-2xl font-bold text-orange-900">
            {number(calculatedSize, 1)} amps
          </div>
          <div className="text-xs text-orange-600 mt-1">
            {loadType === 'continuous' ? 'Load × 125%' : 'Load × 100%'}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-700 mb-1">Recommended Breaker</div>
          <div className="text-2xl font-bold text-blue-900">
            {recommendedBreaker} amp
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Next standard size
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — verify with NEC breaker sizing rules.
      </p>
    </div>
  );
}

// Voltage Drop Calculator
function VoltageDropTool() {
  const [distance, setDistance] = useState('');
  const [loadCurrent, setLoadCurrent] = useState('');
  const [wireGauge, setWireGauge] = useState('12');
  const [voltage, setVoltage] = useState('120');

  // Wire resistance (ohms per 1000 ft) - copper
  const wireResistance = {
    '14': 3.07, '12': 1.93, '10': 1.21, '8': 0.764, '6': 0.491,
    '4': 0.308, '3': 0.245, '2': 0.194, '1': 0.154, '1/0': 0.122
  };

  const voltageDrop = useMemo(() => {
    const dist = parseFloat(distance) || 0;
    const current = parseFloat(loadCurrent) || 0;
    const resistance = wireResistance[wireGauge] || 0;
    const systemVoltage = parseFloat(voltage) || 120;

    if (dist <= 0 || current <= 0) return { volts: 0, percentage: 0 };

    // Voltage drop = 2 × K × I × L / CM (simplified: use resistance per 1000ft)
    const dropVolts = 2 * (resistance / 1000) * current * dist;
    const dropPercentage = (dropVolts / systemVoltage) * 100;

    return { volts: dropVolts, percentage: dropPercentage };
  }, [distance, loadCurrent, wireGauge, voltage]);

  const necLimit = 3; // 3% for branch circuits, 5% for feeders (simplified to 3%)
  const passesNEC = voltageDrop.percentage <= necLimit;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input
          label="Distance"
          value={distance}
          onChange={setDistance}
          suffix="ft"
          placeholder="e.g., 100"
        />
        <Input
          label="Load Current"
          value={loadCurrent}
          onChange={setLoadCurrent}
          suffix="amps"
          placeholder="e.g., 15"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Wire Gauge</label>
          <select
            value={wireGauge}
            onChange={(e) => setWireGauge(e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.keys(wireResistance).map(gauge => (
              <option key={gauge} value={gauge}>{gauge} AWG</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">System Voltage</label>
          <select
            value={voltage}
            onChange={(e) => setVoltage(e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="120">120V</option>
            <option value="240">240V</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-700 mb-1">Voltage Drop</div>
          <div className="text-2xl font-bold text-yellow-900">
            {number(voltageDrop.percentage, 2)}%
          </div>
          <div className="text-xs text-yellow-600 mt-1">
            {number(voltageDrop.volts, 2)} volts
          </div>
        </div>

        <div className={`${passesNEC ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
          <div className={`text-sm ${passesNEC ? 'text-green-700' : 'text-red-700'} mb-1`}>NEC Compliance</div>
          <div className={`text-2xl font-bold ${passesNEC ? 'text-green-900' : 'text-red-900'}`}>
            {passesNEC ? 'PASS' : 'FAIL'}
          </div>
          <div className={`text-xs ${passesNEC ? 'text-green-600' : 'text-red-600'} mt-1`}>
            Limit: {necLimit}% (branch circuit)
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — verify with NEC voltage drop rules.
      </p>
    </div>
  );
}

// Pipe Volume Calculator
function PipeVolumeTool() {
  const [length, setLength] = useState('');
  const [diameter, setDiameter] = useState('');

  const volume = useMemo(() => {
    const L = parseFloat(length) || 0;
    const D = parseFloat(diameter) || 0;

    if (L <= 0 || D <= 0) return 0;

    // Volume = π × (d/2)² × length × 0.0408 (conversion factor ft³ to gallons)
    const radius = D / 2;
    const volumeCubicFeet = Math.PI * Math.pow(radius / 12, 2) * L; // convert inches to feet
    const volumeGallons = volumeCubicFeet * 7.48; // cubic feet to gallons

    return volumeGallons;
  }, [length, diameter]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input
          label="Pipe Length"
          value={length}
          onChange={setLength}
          suffix="ft"
          placeholder="e.g., 100"
        />
        <Input
          label="Pipe Diameter"
          value={diameter}
          onChange={setDiameter}
          suffix="in"
          placeholder="e.g., 4"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-blue-700 mb-1">Pipe Volume</div>
        <div className="text-2xl font-bold text-blue-900">
          {number(volume, 2)} gallons
        </div>
        <div className="text-xs text-blue-600 mt-1">
          {number(volume * 3.785, 1)} liters
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — verify with pipe tables for accuracy.
      </p>
    </div>
  );
}

// Flow vs Pressure Drop Calculator
function FlowPressureDropTool() {
  const [pipeSize, setPipeSize] = useState('0.75');
  const [pipeLength, setPipeLength] = useState('');
  const [flowRate, setFlowRate] = useState('');

  // Simplified pressure drop coefficients (psi per 100 ft per GPM²)
  const pressureDropCoefficients = {
    '0.5': 0.15,   // ½"
    '0.75': 0.045, // ¾"
    '1': 0.018,    // 1"
    '1.25': 0.008, // 1¼"
    '1.5': 0.005,  // 1½"
    '2': 0.002,    // 2"
    '2.5': 0.001,  // 2½"
    '3': 0.0006,   // 3"
    '4': 0.0002    // 4"
  };

  const pressureDrop = useMemo(() => {
    const length = parseFloat(pipeLength) || 0;
    const flow = parseFloat(flowRate) || 0;
    const coefficient = pressureDropCoefficients[pipeSize] || 0;

    if (length <= 0 || flow <= 0) return 0;

    // Simplified: Pressure drop = coefficient × flow² × (length/100)
    return coefficient * Math.pow(flow, 2) * (length / 100);
  }, [pipeSize, pipeLength, flowRate]);

  const passesGuideline = pressureDrop <= 4; // Common guideline: <4 psi drop

  const pipeSizeOptions = [
    { value: '0.5', label: '½"' },
    { value: '0.75', label: '¾"' },
    { value: '1', label: '1"' },
    { value: '1.25', label: '1¼"' },
    { value: '1.5', label: '1½"' },
    { value: '2', label: '2"' },
    { value: '2.5', label: '2½"' },
    { value: '3', label: '3"' },
    { value: '4', label: '4"' }
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Pipe Size</label>
          <select
            value={pipeSize}
            onChange={(e) => setPipeSize(e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            {pipeSizeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <Input
          label="Pipe Length"
          value={pipeLength}
          onChange={setPipeLength}
          suffix="ft"
          placeholder="e.g., 50"
        />
        <Input
          label="Flow Rate"
          value={flowRate}
          onChange={setFlowRate}
          suffix="GPM"
          placeholder="e.g., 8"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm text-orange-700 mb-1">Pressure Drop</div>
          <div className="text-2xl font-bold text-orange-900">
            {number(pressureDrop, 2)} psi
          </div>
          <div className="text-xs text-orange-600 mt-1">
            Over {pipeLength || 0} ft of {pipeSizeOptions.find(p => p.value === pipeSize)?.label} pipe
          </div>
        </div>

        <div className={`${passesGuideline ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
          <div className={`text-sm ${passesGuideline ? 'text-green-700' : 'text-red-700'} mb-1`}>Guideline Check</div>
          <div className={`text-2xl font-bold ${passesGuideline ? 'text-green-900' : 'text-red-900'}`}>
            {passesGuideline ? 'GOOD' : 'HIGH'}
          </div>
          <div className={`text-xs ${passesGuideline ? 'text-green-600' : 'text-red-600'} mt-1`}>
            Target: &lt;4 psi drop
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — verify with engineering charts.
      </p>
    </div>
  );
}

// Fixture Unit Load Calculator
function FixtureUnitTool() {
  const [sinks, setSinks] = useState('');
  const [toilets, setToilets] = useState('');
  const [showers, setShowers] = useState('');
  const [otherFixtures, setOtherFixtures] = useState({});

  // Fixture unit values (simplified IPC/UPC values)
  const fixtureUnits = {
    sink: 2,
    toilet: 3,
    shower: 2,
    bathtub: 2,
    dishwasher: 2,
    washingMachine: 3,
    laundryTub: 2
  };

  const additionalFixtures = [
    { key: 'bathtub', label: 'Bathtubs', units: 2 },
    { key: 'dishwasher', label: 'Dishwashers', units: 2 },
    { key: 'washingMachine', label: 'Washing Machines', units: 3 },
    { key: 'laundryTub', label: 'Laundry Tubs', units: 2 }
  ];

  const totalFixtureUnits = useMemo(() => {
    const sinkUnits = (parseFloat(sinks) || 0) * fixtureUnits.sink;
    const toiletUnits = (parseFloat(toilets) || 0) * fixtureUnits.toilet;
    const showerUnits = (parseFloat(showers) || 0) * fixtureUnits.shower;

    const otherUnits = Object.entries(otherFixtures).reduce((sum, [key, count]) => {
      return sum + ((parseFloat(count) || 0) * fixtureUnits[key]);
    }, 0);

    return sinkUnits + toiletUnits + showerUnits + otherUnits;
  }, [sinks, toilets, showers, otherFixtures]);

  // Simplified GPM demand calculation (varies by code)
  const approximateGPM = useMemo(() => {
    if (totalFixtureUnits <= 0) return 0;

    // Simplified Hunter's curve approximation
    if (totalFixtureUnits <= 10) return totalFixtureUnits * 0.75;
    if (totalFixtureUnits <= 50) return 7.5 + (totalFixtureUnits - 10) * 0.5;
    return 27.5 + (totalFixtureUnits - 50) * 0.3;
  }, [totalFixtureUnits]);

  const handleOtherFixtureChange = (key, value) => {
    setOtherFixtures(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Input
          label="Sinks"
          value={sinks}
          onChange={setSinks}
          suffix="qty"
          placeholder="e.g., 3"
        />
        <Input
          label="Toilets"
          value={toilets}
          onChange={setToilets}
          suffix="qty"
          placeholder="e.g., 2"
        />
        <Input
          label="Showers"
          value={showers}
          onChange={setShowers}
          suffix="qty"
          placeholder="e.g., 2"
        />
      </div>

      {/* Additional Fixtures */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Fixtures (Optional)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {additionalFixtures.map(fixture => (
            <Input
              key={fixture.key}
              label={`${fixture.label} (${fixture.units} FU each)`}
              value={otherFixtures[fixture.key] || ''}
              onChange={(value) => handleOtherFixtureChange(fixture.key, value)}
              suffix="qty"
              placeholder="0"
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-700 mb-1">Total Fixture Units</div>
          <div className="text-2xl font-bold text-purple-900">
            {totalFixtureUnits} FU
          </div>
          <div className="text-xs text-purple-600 mt-1">
            Combined load rating
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-700 mb-1">Approximate GPM Demand</div>
          <div className="text-2xl font-bold text-blue-900">
            {number(approximateGPM, 1)} GPM
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Estimated peak demand
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
        <div className="text-sm text-amber-800">
          <strong>Fixture Unit Reference:</strong>
          <ul className="mt-1 text-xs space-y-1">
            <li>• Sink: 2 FU • Toilet: 3 FU • Shower: 2 FU</li>
            <li>• Bathtub: 2 FU • Dishwasher: 2 FU • Washing Machine: 3 FU</li>
          </ul>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — verify with IPC/UPC code tables.
      </p>
    </div>
  );
}

// Shingle Bundle Calculator
function ShingleBundleTool() {
  const [inputMethod, setInputMethod] = useState('direct'); // 'direct' or 'calculate'
  const [roofArea, setRoofArea] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [pitch, setPitch] = useState('6/12');
  const [wastePercent, setWastePercent] = useState('10');

  // Pitch multipliers for roof area calculation
  const pitchMultiplier = useMemo(() => {
    const pitchMap = {
      '3/12': 1.03, '4/12': 1.06, '5/12': 1.10, '6/12': 1.12,
      '7/12': 1.16, '8/12': 1.20, '9/12': 1.25, '10/12': 1.30, '12/12': 1.41
    };
    return pitchMap[pitch] || 1.12;
  }, [pitch]);

  // Calculate roof area from dimensions
  const calculatedArea = useMemo(() => {
    if (inputMethod === 'direct') return parseFloat(roofArea) || 0;

    const L = parseFloat(length) || 0;
    const W = parseFloat(width) || 0;
    return L * W * pitchMultiplier;
  }, [inputMethod, roofArea, length, width, pitchMultiplier]);

  const bundlesNeeded = useMemo(() => {
    const area = calculatedArea;
    const waste = parseFloat(wastePercent) || 0;

    if (area <= 0) return 0;

    // Standard: 1 bundle covers 33 sqft (3-tab shingles)
    const adjustedArea = area * (1 + waste / 100);
    return Math.ceil(adjustedArea / 33);
  }, [calculatedArea, wastePercent]);

  const totalCoverage = bundlesNeeded * 33;

  return (
    <div>
      {/* Input Method Toggle */}
      <div className="flex items-center gap-4 mb-4">
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="inputMethod"
            value="direct"
            checked={inputMethod === 'direct'}
            onChange={(e) => setInputMethod(e.target.value)}
            className="text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Enter roof area directly</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="inputMethod"
            value="calculate"
            checked={inputMethod === 'calculate'}
            onChange={(e) => setInputMethod(e.target.value)}
            className="text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Calculate from dimensions</span>
        </label>
      </div>

      {/* Input Fields */}
      {inputMethod === 'direct' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="Roof Area"
            value={roofArea}
            onChange={setRoofArea}
            suffix="sqft"
            placeholder="e.g., 1200"
          />
          <Input
            label="Waste Percentage"
            value={wastePercent}
            onChange={setWastePercent}
            suffix="%"
            placeholder="10"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Input
            label="Roof Length"
            value={length}
            onChange={setLength}
            suffix="ft"
            placeholder="e.g., 40"
          />
          <Input
            label="Roof Width"
            value={width}
            onChange={setWidth}
            suffix="ft"
            placeholder="e.g., 30"
          />
          <div>
            <label className="block text-sm text-gray-700 mb-1">Roof Pitch</label>
            <select
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="3/12">3/12 (14°)</option>
              <option value="4/12">4/12 (18°)</option>
              <option value="5/12">5/12 (23°)</option>
              <option value="6/12">6/12 (27°)</option>
              <option value="7/12">7/12 (30°)</option>
              <option value="8/12">8/12 (34°)</option>
              <option value="9/12">9/12 (37°)</option>
              <option value="10/12">10/12 (40°)</option>
              <option value="12/12">12/12 (45°)</option>
            </select>
          </div>
          <Input
            label="Waste Percentage"
            value={wastePercent}
            onChange={setWastePercent}
            suffix="%"
            placeholder="10"
          />
        </div>
      )}

      {/* Show calculated area if using dimensions */}
      {inputMethod === 'calculate' && calculatedArea > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          <div className="text-sm text-gray-700 mb-1">Calculated Roof Area</div>
          <div className="text-lg font-semibold text-gray-900">
            {number(calculatedArea, 0)} sqft
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {length} × {width} × {pitchMultiplier} pitch factor
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-700 mb-1">Bundles Needed</div>
          <div className="text-2xl font-bold text-blue-900">
            {bundlesNeeded} bundles
          </div>
          <div className="text-xs text-blue-600 mt-1">
            3-tab shingles (33 sqft/bundle)
          </div>
          <div className="mt-3">
            <SendToQuoteButton
              toolResult={{
                description: `Architectural shingles - ${roofArea} sqft roof`,
                quantity: bundlesNeeded,
                unit: 'bundles',
                unit_price: 0
              }}
              toolName="Shingle Bundle Calculator"
            />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-700 mb-1">Total Coverage</div>
          <div className="text-2xl font-bold text-green-900">
            {totalCoverage} sqft
          </div>
          <div className="text-xs text-green-600 mt-1">
            Including {wastePercent}% waste
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
        <div className="text-sm text-amber-800">
          <strong>Coverage Reference:</strong>
          <ul className="mt-1 text-xs space-y-1">
            <li>• 3-tab shingles: 33 sqft per bundle</li>
            <li>• Architectural shingles: 32-33 sqft per bundle</li>
            <li>• Premium shingles: 25-30 sqft per bundle</li>
          </ul>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — verify with manufacturer requirements.
      </p>
    </div>
  );
}

// Grout / Thinset Coverage Calculator
function GroutThinsetTool() {
  const [inputMethod, setInputMethod] = useState('direct'); // 'direct' or 'calculate'
  const [tileSize, setTileSize] = useState('12x12');
  const [area, setArea] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [jointWidth, setJointWidth] = useState('0.125'); // 1/8"

  const tileSizeOptions = [
    { value: '4x4', label: '4" × 4"', size: 4 },
    { value: '6x6', label: '6" × 6"', size: 6 },
    { value: '8x8', label: '8" × 8"', size: 8 },
    { value: '12x12', label: '12" × 12"', size: 12 },
    { value: '16x16', label: '16" × 16"', size: 16 },
    { value: '18x18', label: '18" × 18"', size: 18 },
    { value: '24x24', label: '24" × 24"', size: 24 }
  ];

  const jointWidthOptions = [
    { value: '0.0625', label: '1/16"' },
    { value: '0.125', label: '1/8"' },
    { value: '0.1875', label: '3/16"' },
    { value: '0.25', label: '1/4"' },
    { value: '0.375', label: '3/8"' },
    { value: '0.5', label: '1/2"' }
  ];

  // Calculate area from dimensions if needed
  const calculatedArea = useMemo(() => {
    if (inputMethod === 'direct') return parseFloat(area) || 0;

    const L = parseFloat(length) || 0;
    const W = parseFloat(width) || 0;
    return L * W;
  }, [inputMethod, area, length, width]);

  const calculations = useMemo(() => {
    const sqft = calculatedArea;
    const joint = parseFloat(jointWidth) || 0.125;
    const selectedTile = tileSizeOptions.find(t => t.value === tileSize);
    const tileInches = selectedTile?.size || 12;

    if (sqft <= 0) return { groutBags: 0, thinsetBags: 0 };

    // Grout calculation (simplified formula based on tile size and joint width)
    // Coverage varies significantly by tile size and joint width
    let groutCoveragePerBag = 100; // base coverage in sqft

    // Adjust coverage based on tile size (smaller tiles = more joints = less coverage)
    if (tileInches <= 4) groutCoveragePerBag = 50;
    else if (tileInches <= 8) groutCoveragePerBag = 75;
    else if (tileInches <= 12) groutCoveragePerBag = 100;
    else groutCoveragePerBag = 150;

    // Adjust for joint width (wider joints = more grout needed)
    const jointFactor = joint / 0.125; // normalize to 1/8" baseline
    groutCoveragePerBag = groutCoveragePerBag / Math.max(1, jointFactor);

    const groutBags = Math.ceil(sqft / groutCoveragePerBag);

    // Thinset calculation (standard coverage: 95-100 sqft per 50lb bag with 3/16" trowel)
    const thinsetCoveragePerBag = 95; // sqft per 50lb bag
    const thinsetBags = Math.ceil(sqft / thinsetCoveragePerBag);

    return { groutBags, thinsetBags, groutCoveragePerBag, thinsetCoveragePerBag };
  }, [area, tileSize, jointWidth]);

  return (
    <div>
      {/* Input Method Toggle */}
      <div className="flex items-center gap-4 mb-4">
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="inputMethod"
            value="direct"
            checked={inputMethod === 'direct'}
            onChange={(e) => setInputMethod(e.target.value)}
            className="text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Enter area directly</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="inputMethod"
            value="calculate"
            checked={inputMethod === 'calculate'}
            onChange={(e) => setInputMethod(e.target.value)}
            className="text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Calculate from room dimensions</span>
        </label>
      </div>

      {/* Input Fields */}
      {inputMethod === 'direct' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Tile Size</label>
            <select
              value={tileSize}
              onChange={(e) => setTileSize(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              {tileSizeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
          <Input
            label="Area"
            value={area}
            onChange={setArea}
            suffix="sqft"
            placeholder="e.g., 200"
          />
          <div>
            <label className="block text-sm text-gray-700 mb-1">Joint Width</label>
            <select
              value={jointWidth}
              onChange={(e) => setJointWidth(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              {jointWidthOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Tile Size</label>
            <select
              value={tileSize}
              onChange={(e) => setTileSize(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              {tileSizeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <Input
            label="Room Length"
            value={length}
            onChange={setLength}
            suffix="ft"
            placeholder="e.g., 12"
          />
          <Input
            label="Room Width"
            value={width}
            onChange={setWidth}
            suffix="ft"
            placeholder="e.g., 10"
          />
          <div>
            <label className="block text-sm text-gray-700 mb-1">Joint Width</label>
            <select
              value={jointWidth}
              onChange={(e) => setJointWidth(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              {jointWidthOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Show calculated area if using dimensions */}
      {inputMethod === 'calculate' && calculatedArea > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          <div className="text-sm text-gray-700 mb-1">Calculated Floor Area</div>
          <div className="text-lg font-semibold text-gray-900">
            {number(calculatedArea, 0)} sqft
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {length} × {width} ft
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-700 mb-1">Grout Needed</div>
          <div className="text-2xl font-bold text-purple-900">
            {calculations.groutBags} bags
          </div>
          <div className="text-xs text-purple-600 mt-1">
            ~{Math.round(calculations.groutCoveragePerBag)} sqft per bag
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm text-orange-700 mb-1">Thinset Needed</div>
          <div className="text-2xl font-bold text-orange-900">
            {calculations.thinsetBags} bags
          </div>
          <div className="text-xs text-orange-600 mt-1">
            50lb bags (~95 sqft each)
          </div>
          {(calculations.groutBags > 0 || calculations.thinsetBags > 0) && (
            <div className="mt-3 space-y-2">
              {calculations.groutBags > 0 && (
                <SendToQuoteButton
                  toolResult={{
                    description: `Grout - ${tileSize} tiles, ${area} sqft`,
                    quantity: calculations.groutBags,
                    unit: 'bags',
                    unit_price: 0
                  }}
                  toolName="Grout Calculator"
                />
              )}
              {calculations.thinsetBags > 0 && (
                <SendToQuoteButton
                  toolResult={{
                    description: `Thinset - ${area} sqft @ 3/16" depth`,
                    quantity: calculations.thinsetBags,
                    unit: 'bags (50lb)',
                    unit_price: 0
                  }}
                  toolName="Thinset Calculator"
                />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
        <div className="text-sm text-amber-800">
          <strong>Coverage Guidelines:</strong>
          <ul className="mt-1 text-xs space-y-1">
            <li>• Smaller tiles require more grout (more joints)</li>
            <li>• Wider joints require more grout per sqft</li>
            <li>• Thinset coverage assumes 3/16" trowel depth</li>
          </ul>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — verify with manufacturer coverage data.
      </p>
    </div>
  );
}

// Paint Coverage Calculator
function PaintCoverageTool() {
  const [wallArea, setWallArea] = useState('');
  const [coats, setCoats] = useState('2');
  const [coveragePerGallon, setCoveragePerGallon] = useState('350');

  const gallonsNeeded = useMemo(() => {
    const area = parseFloat(wallArea) || 0;
    const numCoats = parseFloat(coats) || 1;
    const coverage = parseFloat(coveragePerGallon) || 350;

    if (area <= 0 || coverage <= 0) return 0;

    return (area * numCoats) / coverage;
  }, [wallArea, coats, coveragePerGallon]);

  const totalArea = useMemo(() => {
    const area = parseFloat(wallArea) || 0;
    const numCoats = parseFloat(coats) || 1;
    return area * numCoats;
  }, [wallArea, coats]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Input
          label="Wall Area"
          value={wallArea}
          onChange={setWallArea}
          suffix="sqft"
          placeholder="e.g., 800"
        />
        <Input
          label="Number of Coats"
          value={coats}
          onChange={setCoats}
          suffix="coats"
          placeholder="2"
        />
        <Input
          label="Coverage per Gallon"
          value={coveragePerGallon}
          onChange={setCoveragePerGallon}
          suffix="sqft/gal"
          placeholder="350"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-700 mb-1">Paint Needed</div>
          <div className="text-2xl font-bold text-blue-900">
            {number(gallonsNeeded, 2)} gallons
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Total coverage: {totalArea} sqft
          </div>
          <div className="mt-3">
            <SendToQuoteButton
              toolResult={{
                description: `Interior paint - ${totalArea} sqft coverage`,
                quantity: Math.ceil(gallonsNeeded),
                unit: 'gallons',
                unit_price: 0
              }}
              toolName="Paint Coverage Calculator"
            />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-700 mb-1">Recommended Purchase</div>
          <div className="text-2xl font-bold text-green-900">
            {Math.ceil(gallonsNeeded)} gallons
          </div>
          <div className="text-xs text-green-600 mt-1">
            Rounded up for purchase
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
        <div className="text-sm text-amber-800">
          <strong>Coverage Guidelines:</strong>
          <ul className="mt-1 text-xs space-y-1">
            <li>• Primer: 200-300 sqft/gal</li>
            <li>• Flat paint: 350-400 sqft/gal</li>
            <li>• Semi-gloss: 300-350 sqft/gal</li>
          </ul>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — verify with paint manufacturer coverage data.
      </p>
    </div>
  );
}

// Paint Cost Estimator
function PaintCostTool() {
  const [gallonsRequired, setGallonsRequired] = useState('');
  const [costPerGallon, setCostPerGallon] = useState('');

  const totalCost = useMemo(() => {
    const gallons = parseFloat(gallonsRequired) || 0;
    const cost = parseFloat(costPerGallon) || 0;

    return gallons * cost;
  }, [gallonsRequired, costPerGallon]);

  const roundedGallons = Math.ceil(parseFloat(gallonsRequired) || 0);
  const roundedCost = roundedGallons * (parseFloat(costPerGallon) || 0);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input
          label="Gallons Required"
          value={gallonsRequired}
          onChange={setGallonsRequired}
          suffix="gal"
          placeholder="e.g., 2.3"
        />
        <Input
          label="Cost per Gallon"
          value={costPerGallon}
          onChange={setCostPerGallon}
          prefix="$"
          placeholder="e.g., 45"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-700 mb-1">Exact Cost</div>
          <div className="text-2xl font-bold text-purple-900">
            ${number(totalCost, 2)}
          </div>
          <div className="text-xs text-purple-600 mt-1">
            {gallonsRequired} gal × ${costPerGallon}/gal
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm text-orange-700 mb-1">Purchase Cost</div>
          <div className="text-2xl font-bold text-orange-900">
            ${number(roundedCost, 2)}
          </div>
          <div className="text-xs text-orange-600 mt-1">
            {roundedGallons} gal (rounded up)
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — actual costs may vary.
      </p>
    </div>
  );
}

// Mulch / Soil Volume Calculator
function MulchSoilTool() {
  const [inputMethod, setInputMethod] = useState('direct'); // 'direct' or 'calculate'
  const [area, setArea] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');

  // Calculate area from dimensions if needed
  const calculatedArea = useMemo(() => {
    if (inputMethod === 'direct') return parseFloat(area) || 0;

    const L = parseFloat(length) || 0;
    const W = parseFloat(width) || 0;
    return L * W;
  }, [inputMethod, area, length, width]);

  const cubicYards = useMemo(() => {
    const sqft = calculatedArea;
    const depthInches = parseFloat(depth) || 0;

    if (sqft <= 0 || depthInches <= 0) return 0;

    // Volume = Area × Depth ÷ 324 (conversion factor)
    // 324 = 27 cubic feet per yard × 12 inches per foot
    return (sqft * depthInches) / 324;
  }, [area, depth]);

  const cubicFeet = cubicYards * 27;
  const bags = Math.ceil(cubicYards * 13.5); // Approximate bags (2 cu ft bags)

  return (
    <div>
      {/* Input Method Toggle */}
      <div className="flex items-center gap-4 mb-4">
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="inputMethod"
            value="direct"
            checked={inputMethod === 'direct'}
            onChange={(e) => setInputMethod(e.target.value)}
            className="text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Enter area directly</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="inputMethod"
            value="calculate"
            checked={inputMethod === 'calculate'}
            onChange={(e) => setInputMethod(e.target.value)}
            className="text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Calculate from dimensions</span>
        </label>
      </div>

      {/* Input Fields */}
      {inputMethod === 'direct' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="Area"
            value={area}
            onChange={setArea}
            suffix="sqft"
            placeholder="e.g., 500"
          />
          <Input
            label="Depth"
            value={depth}
            onChange={setDepth}
            suffix="inches"
            placeholder="e.g., 3"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            label="Length"
            value={length}
            onChange={setLength}
            suffix="ft"
            placeholder="e.g., 25"
          />
          <Input
            label="Width"
            value={width}
            onChange={setWidth}
            suffix="ft"
            placeholder="e.g., 20"
          />
          <Input
            label="Depth"
            value={depth}
            onChange={setDepth}
            suffix="inches"
            placeholder="e.g., 3"
          />
        </div>
      )}

      {/* Show calculated area if using dimensions */}
      {inputMethod === 'calculate' && calculatedArea > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          <div className="text-sm text-gray-700 mb-1">Calculated Area</div>
          <div className="text-lg font-semibold text-gray-900">
            {number(calculatedArea, 0)} sqft
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {length} × {width} ft
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-700 mb-1">Volume Needed</div>
          <div className="text-2xl font-bold text-green-900">
            {number(cubicYards, 2)} yd³
          </div>
          <div className="text-xs text-green-600 mt-1">
            {number(cubicFeet, 1)} cubic feet
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-700 mb-1">Bulk Purchase</div>
          <div className="text-2xl font-bold text-blue-900">
            {Math.ceil(cubicYards)} yd³
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Rounded up for delivery
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm text-orange-700 mb-1">Bagged Alternative</div>
          <div className="text-2xl font-bold text-orange-900">
            ~{bags} bags
          </div>
          <div className="text-xs text-orange-600 mt-1">
            2 cu ft bags (approx)
          </div>
          {cubicYards > 0 && (
            <div className="mt-3">
              <SendToQuoteButton
                toolResult={{
                  description: `Mulch/Soil - ${area} sqft @ ${depth}" depth`,
                  quantity: Math.ceil(cubicYards * 10) / 10,
                  unit: 'cubic yards',
                  unit_price: 0
                }}
                toolName="Mulch/Soil Calculator"
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
        <div className="text-sm text-amber-800">
          <strong>Depth Guidelines:</strong>
          <ul className="mt-1 text-xs space-y-1">
            <li>• Mulch: 2-4 inches deep</li>
            <li>• Topsoil: 2-6 inches for new beds</li>
            <li>• Compost: 1-2 inches for amendment</li>
          </ul>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — verify with supplier yardage.
      </p>
    </div>
  );
}

// Sod / Grass Seed Calculator
function SodSeedTool() {
  const [inputMethod, setInputMethod] = useState('direct'); // 'direct' or 'calculate'
  const [lawnArea, setLawnArea] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [seedRate, setSeedRate] = useState('3');
  const [sodRollSize, setSodRollSize] = useState('10');

  // Calculate area from dimensions if needed
  const calculatedArea = useMemo(() => {
    if (inputMethod === 'direct') return parseFloat(lawnArea) || 0;

    const L = parseFloat(length) || 0;
    const W = parseFloat(width) || 0;
    return L * W;
  }, [inputMethod, lawnArea, length, width]);

  const calculations = useMemo(() => {
    const area = calculatedArea;
    const rate = parseFloat(seedRate) || 3;
    const rollSize = parseFloat(sodRollSize) || 10;

    if (area <= 0) return { sodRolls: 0, seedPounds: 0 };

    const sodRolls = Math.ceil(area / rollSize);
    const seedPounds = (area / 1000) * rate; // rate is per 1000 sqft

    return { sodRolls, seedPounds };
  }, [calculatedArea, seedRate, sodRollSize]);

  return (
    <div>
      {/* Input Method Toggle */}
      <div className="flex items-center gap-4 mb-4">
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="inputMethod"
            value="direct"
            checked={inputMethod === 'direct'}
            onChange={(e) => setInputMethod(e.target.value)}
            className="text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Enter lawn area directly</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="inputMethod"
            value="calculate"
            checked={inputMethod === 'calculate'}
            onChange={(e) => setInputMethod(e.target.value)}
            className="text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Calculate from dimensions</span>
        </label>
      </div>

      {/* Input Fields */}
      {inputMethod === 'direct' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            label="Lawn Area"
            value={lawnArea}
            onChange={setLawnArea}
            suffix="sqft"
            placeholder="e.g., 2000"
          />
          <Input
            label="Seed Rate"
            value={seedRate}
            onChange={setSeedRate}
            suffix="lbs/1000 sqft"
            placeholder="3"
          />
          <Input
            label="Sod Roll Size"
            value={sodRollSize}
            onChange={setSodRollSize}
            suffix="sqft/roll"
            placeholder="10"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Input
            label="Length"
            value={length}
            onChange={setLength}
            suffix="ft"
            placeholder="e.g., 50"
          />
          <Input
            label="Width"
            value={width}
            onChange={setWidth}
            suffix="ft"
            placeholder="e.g., 40"
          />
          <Input
            label="Seed Rate"
            value={seedRate}
            onChange={setSeedRate}
            suffix="lbs/1000 sqft"
            placeholder="3"
          />
          <Input
            label="Sod Roll Size"
            value={sodRollSize}
            onChange={setSodRollSize}
            suffix="sqft/roll"
            placeholder="10"
          />
        </div>
      )}

      {/* Show calculated area if using dimensions */}
      {inputMethod === 'calculate' && calculatedArea > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          <div className="text-sm text-gray-700 mb-1">Calculated Lawn Area</div>
          <div className="text-lg font-semibold text-gray-900">
            {number(calculatedArea, 0)} sqft
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {length} × {width} ft
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-700 mb-1">Sod Option</div>
          <div className="text-2xl font-bold text-green-900">
            {calculations.sodRolls} rolls
          </div>
          <div className="text-xs text-green-600 mt-1">
            {sodRollSize} sqft per roll
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-700 mb-1">Seed Option</div>
          <div className="text-2xl font-bold text-blue-900">
            {number(calculations.seedPounds, 1)} lbs
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {seedRate} lbs per 1000 sqft
          </div>
          {calculations.seedPounds > 0 && (
            <div className="mt-3 space-y-2">
              <SendToQuoteButton
                toolResult={{
                  description: `Sod installation - ${lawnArea} sqft`,
                  quantity: calculations.sodRolls,
                  unit: 'rolls',
                  unit_price: 0
                }}
                toolName="Sod Calculator"
              />
              <SendToQuoteButton
                toolResult={{
                  description: `Grass seed - ${lawnArea} sqft @ ${seedRate} lbs/1000 sqft`,
                  quantity: Math.ceil(calculations.seedPounds),
                  unit: 'lbs',
                  unit_price: 0
                }}
                toolName="Seed Calculator"
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
        <div className="text-sm text-amber-800">
          <strong>Seeding Guidelines:</strong>
          <ul className="mt-1 text-xs space-y-1">
            <li>• Cool season grass: 2-4 lbs/1000 sqft</li>
            <li>• Warm season grass: 1-2 lbs/1000 sqft</li>
            <li>• Overseeding: 1-2 lbs/1000 sqft</li>
          </ul>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Planning tool only — verify with supplier recommendations.
      </p>
    </div>
  );
}

// Send to Quote Modal Component
const SendToQuoteModal = ({ isOpen, onClose, toolResult, toolName, targetQuoteId = null }) => {
  const { user } = useUser();
  const [quotes, setQuotes] = useState([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState(targetQuoteId || '');
  const [formData, setFormData] = useState({
    description: '',
    quantity: 1,
    unit: '',
    unit_price: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [quotesLoading, setQuotesLoading] = useState(false);

  // Load available quotes when modal opens
  useEffect(() => {
    if (isOpen && user?.company_id) {
      loadQuotes();
      // Pre-fill form data from tool result
      if (toolResult) {
        setFormData({
          description: toolResult.description || '',
          quantity: toolResult.quantity || 1,
          unit: toolResult.unit || '',
          unit_price: toolResult.unit_price || 0,
          total: (toolResult.quantity || 1) * (toolResult.unit_price || 0)
        });
      }
    }
  }, [isOpen, user?.company_id, toolResult]);

  // Auto-calculate total when quantity or unit_price changes
  useEffect(() => {
    const total = (parseFloat(formData.quantity) || 0) * (parseFloat(formData.unit_price) || 0);
    setFormData(prev => ({ ...prev, total }));
  }, [formData.quantity, formData.unit_price]);

  const loadQuotes = async () => {
    setQuotesLoading(true);
    try {
      const response = await supaFetch(
        `work_orders?select=id,title,quote_number,created_at&status=in.(QUOTE,SENT,ACCEPTED,REJECTED)&order=created_at.desc`,
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const data = await response.json();
        setQuotes(data || []);
        if (data.length > 0) {
          setSelectedQuoteId(data[0].id); // Auto-select first quote
        }
      }
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setQuotesLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedQuoteId) {
      alert('Please select a quote');
      return;
    }

    setLoading(true);
    try {
      // Insert into work_order_items
      const itemData = {
        work_order_id: selectedQuoteId,
        company_id: user.company_id,
        item_name: formData.description,
        description: `Added from ${toolName} calculator`,
        item_type: 'material',
        quantity: parseFloat(formData.quantity) || 1,
        rate: parseFloat(formData.unit_price) || 0,
        total: parseFloat(formData.total) || 0
      };

      const itemResponse = await supaFetch('work_order_items', {
        method: 'POST',
        body: itemData
      }, user.company_id);

      if (!itemResponse.ok) {
        throw new Error('Failed to add item to quote');
      }

      // Log tool usage in quote_tool_usage
      try {
        const toolUsageData = {
          quote_id: selectedQuoteId,
          tool_id: null, // We don't have tool IDs in our current system
          input_data: toolResult || {},
          output_amount: parseFloat(formData.total) || 0,
          created_by: user.id,
          created_at: new Date().toISOString()
        };

        await supaFetch('quote_tool_usage', {
          method: 'POST',
          body: toolUsageData
        }, user.company_id);
      } catch (toolError) {
        console.warn('Failed to log tool usage:', toolError);
        // Don't fail the main operation if tool logging fails
      }

      // Update work order totals
      await updateQuoteTotals(selectedQuoteId);

      // Show success message
      const selectedQuote = quotes.find(q => q.id === selectedQuoteId);
      const quoteNumber = selectedQuote?.quote_number || selectedQuote?.title || 'Quote';

      // Simple success notification (you can replace with your toast system)
      alert(`Item added to ${quoteNumber} successfully!`);

      onClose();
    } catch (error) {
      console.error('Error adding item to quote:', error);
      alert('Failed to add item to quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateQuoteTotals = async (quoteId) => {
    try {
      // Get all items for this quote
      const itemsResponse = await supaFetch(
        `work_order_items?work_order_id=eq.${quoteId}&select=total`,
        { method: 'GET' },
        user.company_id
      );

      if (itemsResponse.ok) {
        const items = await itemsResponse.json();
        const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

        // Update work order totals
        await supaFetch(`work_orders?id=eq.${quoteId}`, {
          method: 'PATCH',
          body: {
            subtotal: subtotal,
            total_amount: subtotal, // Add tax calculation here if needed
            updated_at: new Date().toISOString()
          }
        }, user.company_id);
      }
    } catch (error) {
      console.warn('Failed to update quote totals:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Send to Quote</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Quote Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Quote
            </label>
            {quotesLoading ? (
              <div className="text-sm text-gray-500">Loading quotes...</div>
            ) : quotes.length === 0 ? (
              <div className="text-sm text-red-600">No quotes available. Create a quote first.</div>
            ) : (
              <select
                value={selectedQuoteId}
                onChange={(e) => setSelectedQuoteId(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a quote...</option>
                {quotes.map(quote => (
                  <option key={quote.id} value={quote.id}>
                    {quote.quote_number || quote.title} ({new Date(quote.created_at).toLocaleDateString()})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Item Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Item description"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., sqft, bundles"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.unit_price}
              onChange={(e) => handleInputChange('unit_price', e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.total.toFixed(2)}
              readOnly
              className="w-full rounded-lg border-gray-300 bg-gray-50 text-gray-600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || quotes.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-4 h-4" />
                  Add to Quote
                </>

              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Send to Quote Button Component
// Component for Tools page - shows "Send to Quote" and opens modal
export const SendToQuoteButton = ({ toolResult, toolName, className = "", targetQuoteId = null, disabled: disabledProp = false }) => {
  const { targetQuoteId: contextQuoteId } = useToolsContext() || { targetQuoteId: null };
  const [showModal, setShowModal] = useState(false);

  // Prefer explicit prop, then context, else null (will prompt user to select a quote)
  const effectiveQuoteId = targetQuoteId || contextQuoteId || null;
  const isValid = !!toolResult && isFinite(toolResult.quantity) && toolResult.quantity > 0 && !!toolResult.description && !!toolResult.unit;
  const disabled = disabledProp || !isValid;
  const label = effectiveQuoteId ? 'Add to Quote' : 'Send to Quote';

  // Debug logging
  console.log('SendToQuoteButton:', {
    toolName,
    effectiveQuoteId,
    contextQuoteId,
    targetQuoteId,
    isValid,
    toolResult,
    hasContext: !!contextQuoteId
  });

  return (
    <>
      <button
        type="button"
        onClick={() => !disabled && setShowModal(true)}
        disabled={disabled}
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
          disabled ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
        } ${className}`}
        title={disabled ? 'Enter inputs to enable adding to quote' : label}
      >
        <PaperAirplaneIcon className="w-4 h-4" />
        {label}
      </button>

      <SendToQuoteModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        toolResult={toolResult}
        toolName={toolName}
        targetQuoteId={effectiveQuoteId}
      />
    </>
  );
};

// Tool Preferences API Functions
const useToolPreferences = () => {
  const { user } = useUser();
  const userId = user?.id;

  const fetchPreferences = async () => {
    if (!userId) return {};

    try {
      const response = await supaFetch(`tool_preferences?user_id=eq.${userId}`, { method: 'GET' });
      if (response.ok) {
        const preferences = await response.json();
        const prefsMap = {};
        preferences.forEach(pref => {
          prefsMap[pref.tool_key] = pref.enabled;
        });
        return prefsMap;
      }
    } catch (error) {
      console.error('Error fetching tool preferences:', error);
    }
    return {};
  };

  const updatePreference = async (toolKey, enabled) => {
    if (!userId) return;

    try {
      const payload = {
        user_id: userId,
        tool_key: toolKey,
        enabled: enabled,
        updated_at: new Date().toISOString()
      };

      // Upsert the preference
      const response = await supaFetch('tool_preferences', {
        method: 'POST',
        body: payload,
        headers: {
          'Prefer': 'resolution=merge-duplicates'
        }
      });

      if (!response.ok) {
        console.error('Error updating tool preference');
      }
    } catch (error) {
      console.error('Error updating tool preference:', error);
    }
  };

  return { fetchPreferences, updatePreference };
};

// Manage Tools Modal Component
const ManageToolsModal = ({ isOpen, onClose, tradeCategories, toolPreferences, onPreferenceChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Manage Tools</h2>
            <p className="text-sm text-gray-600">Turn off tools you don't use. Disabled tools will not appear in your Tools page or Quotes.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {Object.entries(tradeCategories).map(([categoryKey, category]) => (
              <div key={categoryKey} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <category.icon className="w-5 h-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">{category.title}</h3>
                  <span className="text-sm text-gray-500">({category.tools.length} tools)</span>
                </div>

                <div className="space-y-3">
                  {category.tools.map(tool => {
                    const isEnabled = toolPreferences[tool.id] !== false; // Default to true if not set

                    return (
                      <div key={tool.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <tool.icon className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-sm text-gray-900">{tool.title}</div>
                            <div className="text-xs text-gray-500">{tool.subtitle}</div>
                          </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isEnabled}
                            onChange={(e) => onPreferenceChange(tool.id, e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t p-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Trade Section Component
const TradeSection = ({ title, icon: Icon, tools, expandedTool, onToggle, isExpanded, onSectionToggle }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
    <button
      onClick={onSectionToggle}
      className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-6 h-6 text-gray-600 flex-shrink-0" />}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{tools.length} calculators</p>
        </div>
      </div>
      {isExpanded ? (
        <ChevronDownIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
      ) : (
        <ChevronRightIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
      )}
    </button>
    {isExpanded && (
      <div className="border-t border-gray-200 p-4 space-y-3">
        {tools.map((tool) => {
          const ToolComponent = tool.component;
          return (
            <AccordionPanel
              key={tool.id}
              title={tool.title}
              subtitle={tool.subtitle}
              icon={tool.icon}
              isExpanded={expandedTool === tool.id}
              onToggle={() => onToggle(tool.id)}
            >
              <ToolComponent />
            </AccordionPanel>
          );
        })}
      </div>
    )}
  </div>
);

export default function Tools() {
  const [expandedTool, setExpandedTool] = useState(null);
  const [expandedSection, setExpandedSection] = useState('general'); // Default to General open
  const [showManageModal, setShowManageModal] = useState(false);
  const [toolPreferences, setToolPreferences] = useState({});
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  const { fetchPreferences, updatePreference } = useToolPreferences();

  // Load tool preferences on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      const prefs = await fetchPreferences();
      setToolPreferences(prefs);
      setPreferencesLoaded(true);
    };

    loadPreferences();
  }, []);

  const handlePreferenceChange = async (toolKey, enabled) => {
    // Update local state immediately for responsive UI
    setToolPreferences(prev => ({
      ...prev,
      [toolKey]: enabled
    }));

    // Update in database
    await updatePreference(toolKey, enabled);
  };

  const tradeCategories = {
    general: {
      title: 'General Contractor',
      icon: WrenchScrewdriverIcon,
      tools: [
        {
          id: 'area-coverage',
          title: 'Area & Coverage Calculator',
          subtitle: 'Calculate paint, drywall, and flooring quantities',
          icon: PaintBrushIcon,
          component: AreaCoverageTool
        },
        {
          id: 'roofing',
          title: 'Roofing Calculator',
          subtitle: 'Calculate roof area with pitch and waste factors',
          icon: HomeIcon,
          component: RoofingTool
        },
        {
          id: 'materials',
          title: 'Materials Calculator',
          subtitle: 'Calculate concrete and framing materials',
          icon: CubeIcon,
          component: MaterialsTool
        },
        {
          id: 'waste',
          title: 'Waste / Overage Calculator',
          subtitle: 'Calculate material waste for flooring, tile, drywall, and more',
          icon: ExclamationTriangleIcon,
          component: WasteCalculatorTool
        },
        {
          id: 'concrete',
          title: 'Concrete Volume',
          subtitle: 'Slab volume estimate (yards)',
          icon: CubeIcon,
          component: ConcreteTool
        },
        {
          id: 'load-calculator',
          title: 'Load Calculator',
          subtitle: 'Calculate structural loads (floor, roof, snow, wind)',
          icon: ScaleIcon,
          component: LoadCalculatorTool
        },
        {
          id: 'insulation',
          title: 'Insulation Calculator',
          subtitle: 'Calculate insulation batts needed for walls and attics',
          icon: HomeIcon,
          component: InsulationTool
        }
      ]
    },
    hvac: {
      title: 'HVAC',
      icon: FireIcon,
      tools: [
        {
          id: 'hvac-cooling',
          title: 'Cooling Load Calculator',
          subtitle: 'Rough BTU/hr estimate (use professional Manual J for accuracy)',
          icon: FireIcon,
          component: HVACCoolingTool
        },
        {
          id: 'refrigerant-charge',
          title: 'Refrigerant Charge Calculator',
          subtitle: 'Check refrigerant levels using superheat and subcooling',
          icon: FireIcon,
          component: RefrigerantChargeTool
        },
        {
          id: 'duct-sizing',
          title: 'Duct Sizing Calculator',
          subtitle: 'Calculate duct dimensions based on airflow and velocity',
          icon: CubeIcon,
          component: DuctSizingTool
        },
        {
          id: 'heat-loss',
          title: 'Heat Loss Calculator',
          subtitle: 'Estimate heating BTU/hr requirements',
          icon: FireIcon,
          component: HeatLossCalculatorTool
        },
        {
          id: 'lineset-charge',
          title: 'Lineset Charge Calculator',
          subtitle: 'Calculate additional refrigerant for lineset extensions',
          icon: WrenchScrewdriverIcon,
          component: LinesetChargeTool
        }
      ]
    },
    electrical: {
      title: 'Electrical',
      icon: BoltIcon,
      tools: [
        {
          id: 'electrical',
          title: 'Electrical Calculator',
          subtitle: 'Solve Volts, Amps, Watts (single-phase)',
          icon: BoltIcon,
          component: ElectricalTool
        },
        {
          id: 'wire-size',
          title: 'Wire Size / Ampacity Calculator',
          subtitle: 'Determine wire gauge based on load current',
          icon: BoltIcon,
          component: WireSizeTool
        },
        {
          id: 'conduit-fill',
          title: 'Conduit Fill Calculator',
          subtitle: 'Check NEC conduit fill percentages',
          icon: BoltIcon,
          component: ConduitFillTool
        },
        {
          id: 'breaker-sizing',
          title: 'Breaker Sizing Calculator',
          subtitle: 'Size breakers for continuous and non-continuous loads',
          icon: BoltIcon,
          component: BreakerSizingTool
        },
        {
          id: 'voltage-drop',
          title: 'Voltage Drop Calculator',
          subtitle: 'Calculate voltage drop and NEC compliance',
          icon: BoltIcon,
          component: VoltageDropTool
        }
      ]
    },
    plumbing: {
      title: 'Plumbing',
      icon: BeakerIcon,
      tools: [
        {
          id: 'pipe-volume',
          title: 'Pipe Volume Calculator',
          subtitle: 'Calculate pipe volume for drain-down and fill calculations',
          icon: BeakerIcon,
          component: PipeVolumeTool
        },
        {
          id: 'flow-pressure',
          title: 'Flow vs Pressure Drop Calculator',
          subtitle: 'Estimate pressure drop based on flow rate and pipe size',
          icon: BeakerIcon,
          component: FlowPressureDropTool
        },
        {
          id: 'fixture-units',
          title: 'Fixture Unit Load Calculator',
          subtitle: 'Calculate total fixture units and GPM demand',
          icon: BeakerIcon,
          component: FixtureUnitTool
        }
      ]
    },
    roofing: {
      title: 'Roofing',
      icon: HomeIcon,
      tools: [
        {
          id: 'shingle-bundles',
          title: 'Shingle Bundle Calculator',
          subtitle: 'Calculate shingle bundles needed for roof area',
          icon: HomeIcon,
          component: ShingleBundleTool
        }
      ]
    },
    flooring: {
      title: 'Flooring & Tile',
      icon: Square3Stack3DIcon,
      tools: [
        {
          id: 'grout-thinset',
          title: 'Grout / Thinset Coverage Calculator',
          subtitle: 'Calculate grout and thinset bags needed',
          icon: Square3Stack3DIcon,
          component: GroutThinsetTool
        }
      ]
    },
    painting: {
      title: 'Painting',
      icon: PaintBrushIcon,
      tools: [
        // REMOVED: Paint Coverage Calculator - Redundant with Area & Coverage Calculator
        {
          id: 'paint-cost',
          title: 'Paint Cost Estimator',
          subtitle: 'Estimate total paint costs',
          icon: PaintBrushIcon,
          component: PaintCostTool
        }
      ]
    },
    landscaping: {
      title: 'Landscaping',
      icon: SunIcon,
      tools: [
        {
          id: 'mulch-soil',
          title: 'Mulch / Soil Volume Calculator',
          subtitle: 'Calculate cubic yards of mulch or soil needed',
          icon: SunIcon,
          component: MulchSoilTool
        },
        {
          id: 'sod-seed',
          title: 'Sod / Grass Seed Calculator',
          subtitle: 'Calculate sod rolls or seed pounds needed',
          icon: SunIcon,
          component: SodSeedTool
        }
      ]
    },
    utilities: {
      title: 'Universal Utilities',
      icon: ArrowsRightLeftIcon,
      tools: [
        {
          id: 'unit-converter',
          title: 'Unit Converter',
          subtitle: 'Convert length, area, and volume measurements',
          icon: ArrowsRightLeftIcon,
          component: UnitConverterTool
        }
      ]
    }
  };

  const handleToolToggle = (toolId) => {
    setExpandedTool(expandedTool === toolId ? null : toolId);
  };

  const handleSectionToggle = (sectionId) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
      setExpandedTool(null); // Close any open tools when closing section
    } else {
      setExpandedSection(sectionId);
      setExpandedTool(null); // Close any open tools when switching sections
    }
  };

  // Filter tools based on preferences
  const filteredTradeCategories = useMemo(() => {
    if (!preferencesLoaded) return tradeCategories; // Show all tools while loading

    const filtered = {};

    Object.entries(tradeCategories).forEach(([categoryKey, category]) => {
      const enabledTools = category.tools.filter(tool => {
        // Default to enabled if no preference is set
        return toolPreferences[tool.id] !== false;
      });

      // Only include categories that have enabled tools
      if (enabledTools.length > 0) {
        filtered[categoryKey] = {
          ...category,
          tools: enabledTools
        };
      }
    });

    return filtered;
  }, [tradeCategories, toolPreferences, preferencesLoaded]);

  const totalTools = Object.values(filteredTradeCategories).reduce((sum, section) => sum + section.tools.length, 0);
  const enabledTools = Object.values(filteredTradeCategories).reduce((sum, section) =>
    sum + section.tools.filter(tool => toolPreferences[tool.id] !== false).length, 0);
  const tradeCount = Object.keys(filteredTradeCategories).length;

  return (
    <div className="space-y-8 fade-in">
      {/* Modern Page Header */}
      <ModernPageHeader
        title="Trade Tools & Calculators"
        subtitle="Professional calculators organized by trade specialty"
        icon={WrenchScrewdriverIcon}
        gradient="indigo"
        stats={[
          { label: 'Tools Available', value: totalTools },
          { label: 'Enabled', value: enabledTools },
          { label: 'Trade Categories', value: tradeCount }
        ]}
        actions={[
          {
            label: 'Manage Tools',
            icon: CogIcon,
            onClick: () => setShowManageModal(true)
          }
        ]}
      />

      {/* Tool Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ModernCard className="card-gradient-indigo text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Available Tools</p>
                <p className="text-3xl font-bold text-white">{totalTools}</p>
                <p className="text-indigo-200 text-xs mt-1">Professional calculators</p>
              </div>
              <WrenchScrewdriverIcon className="w-12 h-12 text-indigo-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="card-gradient-green text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Tools</p>
                <p className="text-3xl font-bold text-white">{enabledTools}</p>
                <p className="text-green-200 text-xs mt-1">Currently enabled</p>
              </div>
              <CheckCircleIcon className="w-12 h-12 text-green-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="card-gradient-blue text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Trade Categories</p>
                <p className="text-3xl font-bold text-white">{tradeCount}</p>
                <p className="text-blue-200 text-xs mt-1">Specialties covered</p>
              </div>
              <BuildingOfficeIcon className="w-12 h-12 text-blue-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="card-gradient-purple text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Productivity</p>
                <p className="text-3xl font-bold text-white">95%</p>
                <p className="text-purple-200 text-xs mt-1">Time saved</p>
              </div>
              <ChartBarIcon className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </ModernCard>
      </div>

      <div className="space-y-4 max-w-4xl mx-auto">
        {Object.entries(filteredTradeCategories).map(([sectionId, section]) => (
          <TradeSection
            key={sectionId}
            title={section.title}
            icon={section.icon}
            tools={section.tools}
            expandedTool={expandedTool}
            onToggle={handleToolToggle}
            isExpanded={expandedSection === sectionId}
            onSectionToggle={() => handleSectionToggle(sectionId)}
          />
        ))}
      </div>

      <div className="mt-6 text-xs text-gray-500 text-center max-w-4xl mx-auto">
        These tools are provided for convenience and planning. Always validate with professional standards and local code.
      </div>

      <ManageToolsModal
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
        tradeCategories={tradeCategories}
        toolPreferences={toolPreferences}
        onPreferenceChange={handlePreferenceChange}
      />
    </div>
  );
}



// Named exports for tool components so Quotes can reuse them
export {
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
  ShingleBundleTool,
  GroutThinsetTool,
  // PaintCoverageTool, // REMOVED - Redundant
  PaintCostTool,
  MulchSoilTool,
  SodSeedTool
};
