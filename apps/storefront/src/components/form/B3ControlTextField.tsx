import { KeyboardEvent, WheelEvent } from 'react';
import { Controller } from 'react-hook-form';
import { useB3Lang } from '@b3/lang';
import { Box, TextField } from '@mui/material';
import debounce from 'lodash-es/debounce';

import { StyleNumberTextField } from './styled';
import Form from './ui';

export default function B3ControlTextField({ control, errors, ...rest }: Form.B3UIProps) {
  const {
    fieldType,
    isAutoComplete = false,
    name,
    default: defaultValue,
    required,
    label,
    validate,
    variant,
    rows,
    min,
    max,
    minLength,
    maxLength,
    fullWidth,
    muiTextFieldProps,
    disabled,
    labelName,
    size,
    readOnly,
    allowArrow = false,
    sx = {},
    isTip = false,
    tipText = '',
    extraPadding,
    fieldId,
    isEnterTrigger,
    handleEnterClick,
    pattern,
  } = rest;

  const b3Lang = useB3Lang();

  let requiredText = '';
  if (fieldType === 'password') {
    requiredText = b3Lang('global.validate.password.required');
  } else {
    requiredText = b3Lang('global.validate.required', {
      label: labelName || label,
    });
  }

  const fieldsProps = {
    type: fieldType,
    name,
    defaultValue,
    rules: {
      required: required && requiredText,
      validate: validate && ((v: string) => validate(v, b3Lang)),
    },
    control,
  };

  const textField = {
    type: fieldType,
    name,
    label,
    rows,
    disabled,
    multiline: fieldType === 'multiline',
    variant,
    fullWidth: fullWidth || true,
    required,
    size,
  };

  const inputProps = {
    min,
    max,
    maxLength,
    minLength,
    readOnly,
    pattern,
  };

  const muiAttributeProps = muiTextFieldProps
    ? {
        ...muiTextFieldProps,
        ...inputProps,
      }
    : {
        ...inputProps,
      };

  const handleNumberInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const keys = allowArrow ? ['KeyE', 'Period'] : ['ArrowUp', 'ArrowDown', 'KeyE', 'Period'];
    if (keys.indexOf(event.code) > -1) {
      event.preventDefault();
    }
  };

  const handleKeyDown = debounce((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && handleEnterClick) {
      handleEnterClick();
    } else {
      event.preventDefault();
    }
  }, 300);

  const handleListrak = debounce((event) => {
    const target = event.target as HTMLTextAreaElement;
    if (target?.value) {
      window.parent.postMessage(target?.value, '*');
    }
  }, 500);

  // remove debounce to validate string upon enter
  const validateNumberField = (event: KeyboardEvent<HTMLInputElement>) => {
    if (fieldId?.includes('phone_number')) {
      const allowedKeys = [
        'Digit0',
        'Digit1',
        'Digit2',
        'Digit3',
        'Digit4',
        'Digit5',
        'Digit6',
        'Digit7',
        'Digit8',
        'Digit9',
        'Enter',
        'Digit0',
        'Numpad0',
        'Numpad1',
        'Numpad2',
        'Numpad3',
        'Numpad4',
        'Numpad5',
        'Numpad6',
        'Numpad7',
        'Numpad8',
        'Numpad9',
        'Backspace',
      ];
      if (allowedKeys.indexOf(event.code) < 0) {
        event.preventDefault();
      }
    }
  };

  const handleNumberInputWheel = (event: WheelEvent<HTMLInputElement>) => {
    (event.target as HTMLElement).blur();
  };
  const autoCompleteFn = () => {
    if (!isAutoComplete) {
      return {
        autoComplete: 'off',
      };
    }
    return {};
  };
  const newExtraPadding =
    fieldId === 'field_state' && extraPadding.paddingTop === '0px' ? {} : extraPadding;

  return ['text', 'number', 'password', 'multiline'].includes(fieldType) ? (
    <>
      {labelName && (
        <Box
          sx={{
            mb: 1,
          }}
        >
          {`${labelName} :`}
        </Box>
      )}
      <Controller
        key={fieldsProps.name}
        {...fieldsProps}
        render={({ field: { ...rest } }) =>
          fieldType === 'number' ? (
            <StyleNumberTextField
              key={textField.name}
              {...textField}
              {...rest}
              sx={{
                color: disabled ? 'rgba(0, 0, 0, 0.38)' : 'rgba(0, 0, 0, 0.6)',
                '& input': {
                  ...newExtraPadding,
                },
              }}
              allowarrow={allowArrow ? 1 : 0}
              inputProps={muiAttributeProps}
              error={!!errors[name]}
              helperText={(errors as any)[name] ? (errors as any)[name].message : null}
              onKeyDown={handleNumberInputKeyDown}
              onWheel={handleNumberInputWheel}
            />
          ) : (
            <TextField
              key={textField.name}
              {...textField}
              {...rest}
              sx={{
                color: disabled ? 'rgba(0, 0, 0, 0.38)' : 'rgba(0, 0, 0, 0.6)',
                ...sx,
                '& input': {
                  ...newExtraPadding,
                },
                '& textarea': {
                  ...newExtraPadding,
                },
              }}
              inputProps={muiAttributeProps}
              error={!!errors[name]}
              helperText={(errors as any)[name] ? (errors as any)[name].message : null}
              onKeyDown={isEnterTrigger ? handleKeyDown : validateNumberField}
              onBlur={handleListrak}
              {...autoCompleteFn()}
            />
          )
        }
      />
      {isTip && (
        <Box
          sx={{
            fontSize: '12px',
            color: 'rgba(0, 0, 0, 0.6)',
            marginTop: '0.5rem',
          }}
        >
          {tipText}
        </Box>
      )}
    </>
  ) : null;
}
