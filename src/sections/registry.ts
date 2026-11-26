import type { ComponentType } from 'react'
import { OverviewSection } from './OverviewSection'
import { UsersSection } from './UsersSection'

export type PortalSection = {
  id: string
  title: string
  course: string
  summary: string
  adminOnly?: boolean
  Component: ComponentType
}

export const sections: PortalSection[] = [
  {
    id: 'overview',
    title: 'Обзор',
    course: 'Портал',
    summary: 'Личный кабинет после регистрации.',
    Component: OverviewSection,
  },
  {
    id: 'users',
    title: 'Пользователи',
    course: 'Администрирование',
    summary: 'Все профили портала.',
    adminOnly: true,
    Component: UsersSection,
  },
]

export const defaultSectionId = sections[0].id
