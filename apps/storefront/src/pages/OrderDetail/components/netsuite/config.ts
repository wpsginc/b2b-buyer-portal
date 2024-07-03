const getReturnFormFields = () => [
    {
      name: 'return_reason',
      label: 'Return reason',
      required: true,
      xs: 12,
      variant: 'filled',
      size: 'small',
      fieldType: 'dropdown',
      default: '',
      options: [
        {
            label: 'Broken product',
            value: 'Broken product',
        },
        {
            label: 'Change My Mind',
            value: 'Change My Mind',
        },
        {
            label: 'Damaged product',
            value: 'Damaged product',
        },
        {
            label: 'Did not fit',
            value: 'Did not fit',
        },
        {
            label: 'Did not order this item',
            value: 'Did not order this item',
        },
        {
            label: 'Embroidery issue',
            value: 'Embroidery issue',
        },
        {
            label: 'Not as pictured on the Website',
            value: 'Not as pictured on the Website',
        },
        {
            label: 'Not my order',
            value: 'Not my order',
        },
        {
            label: 'Not what expected',
            value: 'Not what expected',
        },
        {
            label: 'Parts missing',
            value: 'Parts missing',
        },
        {
            label: 'Personalization error',
            value: 'Personalization error',
        },
        {
            label: 'Quit working after use',
            value: 'Quit working after use',
        },
        {
            label: 'Request Replacement',
            value: 'Request Replacement',
        },
        {
            label: 'Wrong style/size/color',
            value: 'Wrong style/size/color',
        }
      ],
    },
  ]
  
  export default getReturnFormFields
  