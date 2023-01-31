import {
  useState,
  forwardRef,
  useImperativeHandle,
  Ref,
  useEffect,
  useContext,
} from 'react'

import {
  useForm,
} from 'react-hook-form'

import {
  useB3Lang,
} from '@b3/lang'

import {
  addOrUpdateUsers,
  checkUserEmail,
} from '@/shared/service/b2b'
import {
  B3CustomForm,
  B3Dialog,
} from '@/components'

import {
  snackbar,
} from '@/utils'

import {
  GlobaledContext,
} from '@/shared/global'

import {
  getUsersFiles,
  UsersList,
  UsersFilesProps,
  filterProps,
  emailError,
} from './config'

interface AddEditUserProps {
  companyId: string | number
  renderList: () => void
}

const AddEditUser = ({
  companyId,
  renderList,
}: AddEditUserProps, ref: Ref<unknown> | undefined) => {
  const {
    state: {
      currentChannelId,
    },
  } = useContext(GlobaledContext)

  const [open, setOpen] = useState<boolean>(false)
  const [type, setType] = useState<string>('')

  const [editData, setEditData] = useState<UsersList | null>(null)

  const [addUpdateLoading, setAddUpdateLoading] = useState<boolean>(false)

  const [usersFiles, setUsersFiles] = useState<Array<UsersFilesProps>>([])

  const b3Lang = useB3Lang()

  const {
    control,
    handleSubmit,
    getValues,
    formState: {
      errors,
    },
    clearErrors,
    setValue,
    setError,
  } = useForm({
    mode: 'onSubmit',
  })

  useEffect(() => {
    if (open && type === 'edit' && editData) {
      usersFiles.forEach((item: UsersFilesProps) => {
        setValue(item.name, editData[item.name])
      })
    }
  }, [open, type])

  const handleCancelClick = () => {
    usersFiles.forEach((item: UsersFilesProps) => {
      setValue(item.name, '')
    })
    clearErrors()
    setOpen(false)
  }

  const validateEmailValue = async (emailValue: string) => {
    const {
      userEmailCheck: {
        userType,
        userInfo: {
          companyName,
        },
      },
    }: CustomFieldItems = await checkUserEmail({
      email: emailValue,
      companyId,
      channelId: currentChannelId,
    })

    const isValid = [1, 2, 7].includes(userType)

    if (!isValid) {
      setError('email', {
        type: 'custom',
        message: b3Lang(emailError[userType], {
          companyName,
          email: emailValue,
        }),
      })
    }

    return {
      isValid,
      userType,
    }
  }

  const handleAddUserClick = () => {
    handleSubmit(async (data) => {
      setAddUpdateLoading(true)

      let message = 'add user successfully'

      try {
        const params: Partial<filterProps> = {
          companyId,
          ...data,
        }

        if (type !== 'edit') {
          const {
            isValid,
            userType,
          } = await validateEmailValue(data.email)

          if (!isValid) {
            setAddUpdateLoading(false)
            return
          }

          if (userType === 7) {
            params.addChannel = true
          }

          if (userType === 7) {
            message = `user detected in your company, we will allow current storefront access for email: ${data.email}`
          }
        }

        if (type === 'edit') {
          params.userId = editData?.id || ''
          message = 'update user successfully'
          delete params.email
        }
        await addOrUpdateUsers(params)
        handleCancelClick()

        snackbar.success(message)

        renderList()
      } finally {
        setAddUpdateLoading(false)
      }
    })()
  }

  const handleOpenAddEditUserClick = (type: string, data: UsersList) => {
    const usersFiles = getUsersFiles(type)
    setUsersFiles(usersFiles)
    setEditData(data)
    setType(type)
    setOpen(true)
  }

  useImperativeHandle(ref, () => ({
    handleOpenAddEditUserClick,
  }))

  return (
    <B3Dialog
      isOpen={open}
      title={`${type === 'edit' ? 'Edit user' : ' Add new user'}`}
      leftSizeBtn="cancel"
      rightSizeBtn="Save user"
      handleLeftClick={handleCancelClick}
      handRightClick={handleAddUserClick}
      loading={addUpdateLoading}
      isShowBordered
    >
      <B3CustomForm
        formFields={usersFiles}
        errors={errors}
        control={control}
        getValues={getValues}
        setValue={setValue}
      />
    </B3Dialog>
  )
}

const B3AddEditUser = forwardRef(AddEditUser)

export default B3AddEditUser
