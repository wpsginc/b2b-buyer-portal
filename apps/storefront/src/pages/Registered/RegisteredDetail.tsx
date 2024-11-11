import { MouseEvent, useCallback, useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useB3Lang } from '@b3/lang';
import { Alert, Box } from '@mui/material';
import isEmpty from 'lodash-es/isEmpty';

import { B3CustomForm } from '@/components';
import { getContrastColor } from '@/components/outSideComponents/utils/b3CustomStyles';
import { CustomStyleContext } from '@/shared/customStyleButton';

import RegisteredStepButton from './component/RegisteredStepButton';
import { RegisteredContext } from './context/RegisteredContext';
import { Country, State, validateExtraFields } from './config';
import { InformationFourLabels, TipContent } from './styled';
import { RegisterFields } from './types';

interface RegisteredDetailProps {
  handleBack: () => void;
  handleNext: () => void;
  activeStep: number;
}

export default function RegisteredDetail(props: RegisteredDetailProps) {
  const b3Lang = useB3Lang();
  const { handleBack, handleNext, activeStep } = props;

  const { state, dispatch } = useContext(RegisteredContext);

  const {
    state: {
      portalStyle: { backgroundColor = '#FEF9F5' },
    },
  } = useContext(CustomStyleContext);

  const customColor = getContrastColor(backgroundColor);

  const [errorMessage, setErrorMessage] = useState('');

  const {
    accountType = '1',
    companyInformation = [],
    companyAttachment = [],
    addressBasicFields = [],
    bcAddressBasicFields = [],
    countryList = [],
  } = state;

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
    setValue,
    watch,
    setError,
  } = useForm({
    mode: 'all',
  });
  const businessDetailsName = accountType === '1' ? companyInformation[0]?.groupName : '';

  const addressBasicName = accountType === '1' ? 'addressBasicFields' : 'bcAddressBasicFields';
  const addressBasicList = accountType === '1' ? addressBasicFields : bcAddressBasicFields;

  const updatedCompanyInformation = companyInformation?.map(
    (customFieldsInfo: CustomFieldItems) => {
      const info = customFieldsInfo;
      if (customFieldsInfo.label.toLowerCase() === 'do you need terms?' && accountType === '1') {
        info.isTip = true;
        info.tipText = `Requesting for terms will require you to submit a form, click here to learn more, `;
        info.termsLink = '/terms-info';
      }

      if (customFieldsInfo.fieldId === 'field_company_phone_number' && accountType === '1') {
        info.isTip = true;
        info.tipText = `Please enter company 10 digit phone number `;
        info.maxLength = 10;
        info.pattern = '[0-9]*';
      }

      if (customFieldsInfo.fieldId === 'field_company_email' && accountType === '1') {
        info.isTip = true;
        info.tipText = `Please enter a valid email `;
      }

      return customFieldsInfo;
    },
  );

  const newCompInfo: any =
    accountType === '1' ? updatedCompanyInformation : companyInformation || [];

  const addressName = addressBasicList[0]?.groupName || '';

  const handleCountryChange = useCallback(
    (countryCode: string, stateCode = '') => {
      const stateList =
        countryList.find(
          (country: Country) =>
            country.countryCode === countryCode || country.countryName === countryCode,
        )?.states || [];
      const stateFields = addressBasicList.find(
        (formFields: RegisterFields) => formFields.name === 'state',
      );

      if (stateFields) {
        if (stateList.length > 0) {
          stateFields.fieldType = 'dropdown';
          stateFields.options = stateList;
        } else {
          stateFields.fieldType = 'text';
          stateFields.options = [];
        }
      }

      setValue(
        'state',
        stateCode &&
          countryCode &&
          (stateList.find((state: State) => state.stateName === stateCode) ||
            stateList.length === 0)
          ? stateCode
          : '',
      );

      dispatch({
        type: 'stateList',
        payload: {
          stateList,
          addressBasicFields,
          bcAddressBasicFields,
          [addressBasicName]: [...addressBasicList],
        },
      });
    },
    // disabling as we don't need dispatchers here
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addressBasicFields, addressBasicList, addressBasicName, bcAddressBasicFields, countryList],
  );

  useEffect(() => {
    const countryValue = getValues('country');
    const stateValue = getValues('state');
    handleCountryChange(countryValue, stateValue);
    // disabling as we only need to run this once and values at starting render are good enough
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      const { country, state } = value;

      if (name === 'country' && type === 'change') {
        handleCountryChange(country, state);
      }
    });
    return () => subscription.unsubscribe();
    // disabling as we don't need watch in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryList, handleCountryChange]);

  const showLoading = (isShow = false) => {
    dispatch({
      type: 'loading',
      payload: {
        isLoading: isShow,
      },
    });
  };

  const setRegisterFieldsValue = (formFields: Array<RegisterFields>, formData: CustomFieldItems) =>
    formFields.map((field) => {
      const item = field;
      item.default = formData[field.name] || field.default;
      return field;
    });

  interface DetailsFormValues {
    [K: string]: string | number | boolean;
  }

  const saveDetailsData = () => {
    const data = [...newCompInfo, ...companyAttachment, ...addressBasicList].reduce(
      (formValues: DetailsFormValues, field: RegisterFields) => {
        const values = formValues;
        values[field.name] = getValues(field.name) || field.default;

        return formValues;
      },
      {},
    );

    const newCompanyInformation = setRegisterFieldsValue(newCompInfo, data);
    const newCompanyAttachment = setRegisterFieldsValue(companyAttachment, data);
    const newAddressBasicFields = setRegisterFieldsValue(addressBasicList, data);

    dispatch({
      type: 'all',
      payload: {
        companyInformation: [...newCompanyInformation],
        companyAttachment: [...newCompanyAttachment],
        [addressBasicName]: [...newAddressBasicFields],
      },
    });
  };

  const handleValidateAttachmentFiles = () => {
    if (accountType === '1') {
      const formData = getValues();
      const attachmentsFilesFiled = newCompInfo.find(
        (info: any) => info.fieldId === 'field_attachments',
      );
      if (
        !isEmpty(attachmentsFilesFiled) &&
        attachmentsFilesFiled.required &&
        formData[attachmentsFilesFiled.name].length === 0
      ) {
        setError(attachmentsFilesFiled.name, {
          type: 'required',
          message: b3Lang('global.validate.required', {
            label: attachmentsFilesFiled.label ?? '',
          }),
        });

        showLoading(false);
        return true;
      }
    }

    return false;
  };

  const handleAccountToFinish = (event: MouseEvent) => {
    const hasAttachmentsFilesError = handleValidateAttachmentFiles();

    const phoneNumber =
      companyInformation?.find(
        (item: CustomFieldItems) => item.fieldId === 'field_company_phone_number',
      )?.name || 'phone';

    const companyEmail =
      companyInformation?.find((item: CustomFieldItems) => item.fieldId === 'field_company_email')
        ?.name || 'email';

    const addressPhone =
      addressBasicList?.find((item: CustomFieldItems) => item.label.includes('Phone Number'))
        ?.name || 'phone';

    handleSubmit(async (data: CustomFieldItems) => {
      if (hasAttachmentsFilesError) return;
      showLoading(true);

      if (data[companyEmail]) {
        const regex = /^([a-zA-Z0-9_.+-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (!regex.test(data[companyEmail])) {
          setError(companyEmail, {
            type: 'custom',
            message: 'Please use a valid email address, such as user@example.com.',
          });
          showLoading(false);
          return;
        }
      }

      if (data[phoneNumber]?.length > 10 || data[phoneNumber]?.length < 10) {
        setError(phoneNumber, {
          type: 'custom',
          message: 'Please enter a valid phone number',
        });
        showLoading(false);
        return;
      }

      if (data[addressPhone]?.length > 10 || data[addressPhone]?.length < 10) {
        setError(addressPhone, {
          type: 'custom',
          message: 'Please enter a valid phone number',
        });
        showLoading(false);
        return;
      }

      try {
        if (accountType === '1') {
          await Promise.all([
            validateExtraFields({
              fields: companyInformation,
              data,
              type: 'company',
              setError,
            }),
            validateExtraFields({
              fields: addressBasicFields,
              data,
              type: 'address',
              setError,
            }),
          ]);

          setErrorMessage('');
        }

        saveDetailsData();

        showLoading(false);
        handleNext();
      } catch (error) {
        if (typeof error === 'string') {
          setErrorMessage(error);
        }
        showLoading(false);
      }
    })(event);
  };

  const handleBackAccount = () => {
    saveDetailsData();

    handleBack();
  };

  return (
    <Box
      sx={{
        pl: 1,
        pr: 1,
        mt: 2,
        width: '100%',
        '& h4': {
          color: customColor,
        },
        '& input, & .MuiFormControl-root .MuiTextField-root, & .MuiDropzoneArea-textContainer, & .MuiSelect-select.MuiSelect-filled, & .MuiTextField-root .MuiInputBase-multiline':
          {
            borderRadius: '4px',
            borderBottomLeftRadius: '0',
            borderBottomRightRadius: '0',
          },
      }}
    >
      {errorMessage && (
        <Alert severity="error">
          <TipContent>{errorMessage}</TipContent>
        </Alert>
      )}
      {accountType === '1' ? (
        <Box>
          <InformationFourLabels>{businessDetailsName}</InformationFourLabels>
          <B3CustomForm
            formFields={[...newCompInfo]}
            errors={errors}
            control={control}
            getValues={getValues}
            setValue={setValue}
            setError={setError}
          />
        </Box>
      ) : null}

      <Box>
        <InformationFourLabels>{addressName}</InformationFourLabels>

        <B3CustomForm
          formFields={addressBasicList}
          errors={errors}
          control={control}
          getValues={getValues}
          setValue={setValue}
        />
      </Box>

      <RegisteredStepButton
        handleBack={handleBackAccount}
        handleNext={handleAccountToFinish}
        activeStep={activeStep}
      />
    </Box>
  );
}
