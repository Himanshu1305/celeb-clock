// Central design system — public API. Import pages' theme + layout from here.
export { PajPage, FontLinks, type PajPageProps, type PajVariant } from './PajPage';
export { PageHeader } from './PageHeader';
export { SiteHeader } from './SiteHeader';
export { SiteFooter, type FooterLink } from './SiteFooter';
export { Breadcrumb, type Crumb } from './Breadcrumb';
export {
  ToolLayout,
  ReportLayout,
  HubLayout,
  CollectionLayout,
  ArticleLayout,
  MoneyLayout,
  UtilityLayout,
  type LayoutProps,
} from './layouts';
export { THEMES, THEME_TOKENS, LAYOUTS, type Theme, type ThemeTokens, type LayoutName } from './themes';
