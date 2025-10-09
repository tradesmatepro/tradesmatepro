import { 
  RESPONSE_STATUSES, 
  DB_RESPONSE_STATUS, 
  FORM_TO_DB_STATUS, 
  RESPONSE_TYPE_OPTIONS,
  getStatusDisplay,
  getStatusColor 
} from '../constants/marketplaceEnums';

describe('Marketplace Enums', () => {
  test('FORM_TO_DB_STATUS maps correctly', () => {
    expect(FORM_TO_DB_STATUS['interested']).toBe(DB_RESPONSE_STATUS.INTERESTED);
    expect(FORM_TO_DB_STATUS['offer']).toBe(DB_RESPONSE_STATUS.OFFER_SUBMITTED);
    expect(FORM_TO_DB_STATUS['more_info']).toBe(DB_RESPONSE_STATUS.INFO_REQUESTED);
    expect(FORM_TO_DB_STATUS['site_visit']).toBe(DB_RESPONSE_STATUS.SITE_VISIT_PROPOSED);
  });

  test('DB_RESPONSE_STATUS contains all required values', () => {
    expect(DB_RESPONSE_STATUS.INTERESTED).toBe('INTERESTED');
    expect(DB_RESPONSE_STATUS.OFFER_SUBMITTED).toBe('OFFER_SUBMITTED');
    expect(DB_RESPONSE_STATUS.INFO_REQUESTED).toBe('INFO_REQUESTED');
    expect(DB_RESPONSE_STATUS.SITE_VISIT_PROPOSED).toBe('SITE_VISIT_PROPOSED');
    expect(DB_RESPONSE_STATUS.ACCEPTED).toBe('ACCEPTED');
    expect(DB_RESPONSE_STATUS.DECLINED).toBe('DECLINED');
  });

  test('RESPONSE_TYPE_OPTIONS has correct structure', () => {
    expect(RESPONSE_TYPE_OPTIONS).toHaveLength(4);
    
    const interestedOption = RESPONSE_TYPE_OPTIONS.find(opt => opt.value === 'interested');
    expect(interestedOption).toBeDefined();
    expect(interestedOption.dbValue).toBe(DB_RESPONSE_STATUS.INTERESTED);
    expect(interestedOption.label).toBe(RESPONSE_STATUSES.INTERESTED);
  });

  test('getStatusDisplay returns correct display text', () => {
    expect(getStatusDisplay(DB_RESPONSE_STATUS.INTERESTED)).toBe(RESPONSE_STATUSES.INTERESTED);
    expect(getStatusDisplay(DB_RESPONSE_STATUS.OFFER_SUBMITTED)).toBe(RESPONSE_STATUSES.OFFER_SUBMITTED);
    expect(getStatusDisplay(DB_RESPONSE_STATUS.ACCEPTED)).toBe(RESPONSE_STATUSES.ACCEPTED);
    expect(getStatusDisplay(DB_RESPONSE_STATUS.DECLINED)).toBe(RESPONSE_STATUSES.DECLINED);
  });

  test('getStatusColor returns valid color names', () => {
    const validColors = ['blue', 'green', 'yellow', 'purple', 'emerald', 'red', 'gray'];
    
    expect(validColors).toContain(getStatusColor(DB_RESPONSE_STATUS.INTERESTED));
    expect(validColors).toContain(getStatusColor(DB_RESPONSE_STATUS.OFFER_SUBMITTED));
    expect(validColors).toContain(getStatusColor(DB_RESPONSE_STATUS.ACCEPTED));
    expect(validColors).toContain(getStatusColor(DB_RESPONSE_STATUS.DECLINED));
  });

  test('All form values map to valid DB enums', () => {
    const formValues = ['interested', 'offer', 'more_info', 'site_visit'];
    const dbValues = Object.values(DB_RESPONSE_STATUS);
    
    formValues.forEach(formValue => {
      const dbValue = FORM_TO_DB_STATUS[formValue];
      expect(dbValues).toContain(dbValue);
    });
  });
});
