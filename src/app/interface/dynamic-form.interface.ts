export interface IForm {
  formTitle: string
  titlePage: string
  saveBtnTitle: string
  deleteBtnTitle: string
  updateBtnTitle: string
  formControls: IFormControl[]
}

export interface IFormControl {
  name: string
  label: string
  value: string
  type: string
  class?: string
  validators: IValidator[]
  placeholder?: string
  options?: IOptions[]
}

export interface IOptions {
  id: number
  value: string
  nome: string
  regiao: Regiao
}

export interface Regiao {
  id: number
  value: string
  nome: string
}

export interface IValidator {
  validatorName?: string
  message?: string
  required?: boolean
  pattern?: string | undefined
  minLength?: number
  maxLength?: number
  email?: string
}

export interface SavedDocument {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

