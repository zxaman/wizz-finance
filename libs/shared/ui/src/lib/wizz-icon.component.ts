import {
  ChangeDetectionStrategy,
  Component,
  Provider,
  computed,
  input,
} from '@angular/core';
import {
  LucideArrowDownLeft,
  LucideArrowLeft,
  LucideArrowLeftRight,
  LucideArrowRight,
  LucideArrowUpRight,
  LucideBanknote,
  LucideBell,
  LucideBuilding,
  LucideBuildingComplex,
  LucideCalendar,
  LucideCamera,
  LucideCheck,
  LucideChevronDown,
  LucideChevronLeft,
  LucideChevronRight,
  LucideChevronUp,
  LucideCircleCheck,
  LucideCircleExclamationPoint,
  LucideCirclePlus,
  LucideCircleQuestionMark,
  LucideCircleX,
  LucideClock,
  LucideCopy,
  LucideCreditCard,
  LucideDownload,
  LucideDynamicIcon,
  LucideEllipsis,
  LucideExternalLink,
  LucideEye,
  LucideEyeOff,
  LucideFileText,
  LucideGlobe,
  LucideHeadphones,
  LucideHouse,
  LucideIcon,
  LucideIdCard,
  LucideInfo,
  LucideLandmark,
  LucideLayoutGrid,
  LucideListFilter,
  LucideLoaderCircle,
  LucideLock,
  LucideLogOut,
  LucideMail,
  LucideMapPin,
  LucideMenu,
  LucidePencil,
  LucidePhone,
  LucidePlus,
  LucideReceiptText,
  LucideRefreshCw,
  LucideScanFace,
  LucideSearch,
  LucideSend,
  LucideSettings,
  LucideShare2,
  LucideShield,
  LucideShieldCheck,
  LucideSlidersHorizontal,
  LucideSmartphone,
  LucideSparkles,
  LucideTrash,
  LucideTriangleExclamationPoint,
  LucideUpload,
  LucideUser,
  LucideUserCheck,
  LucideUserPlus,
  LucideUsers,
  LucideWallet,
  LucideX,
  provideLucideIcons,
} from '@lucide/angular';

export const WIZZ_ICON_MAP = {
  'arrow-left': LucideArrowLeft,
  'arrow-right': LucideArrowRight,
  'arrow-up-right': LucideArrowUpRight,
  'arrow-down-left': LucideArrowDownLeft,
  'arrow-left-right': LucideArrowLeftRight,
  banknote: LucideBanknote,
  bell: LucideBell,
  building: LucideBuilding,
  'building-2': LucideBuildingComplex,
  calendar: LucideCalendar,
  camera: LucideCamera,
  check: LucideCheck,
  'check-circle': LucideCircleCheck,
  'chevron-down': LucideChevronDown,
  'chevron-left': LucideChevronLeft,
  'chevron-right': LucideChevronRight,
  'chevron-up': LucideChevronUp,
  'alert-circle': LucideCircleExclamationPoint,
  'alert-triangle': LucideTriangleExclamationPoint,
  'help-circle': LucideCircleQuestionMark,
  clock: LucideClock,
  copy: LucideCopy,
  'credit-card': LucideCreditCard,
  download: LucideDownload,
  ellipsis: LucideEllipsis,
  'external-link': LucideExternalLink,
  eye: LucideEye,
  'eye-off': LucideEyeOff,
  'file-text': LucideFileText,
  filter: LucideListFilter,
  sliders: LucideSlidersHorizontal,
  globe: LucideGlobe,
  headphones: LucideHeadphones,
  home: LucideHouse,
  'id-card': LucideIdCard,
  info: LucideInfo,
  landmark: LucideLandmark,
  grid: LucideLayoutGrid,
  loader: LucideLoaderCircle,
  lock: LucideLock,
  'log-out': LucideLogOut,
  mail: LucideMail,
  'map-pin': LucideMapPin,
  menu: LucideMenu,
  pencil: LucidePencil,
  phone: LucidePhone,
  plus: LucidePlus,
  'plus-circle': LucideCirclePlus,
  receipt: LucideReceiptText,
  refresh: LucideRefreshCw,
  'scan-face': LucideScanFace,
  search: LucideSearch,
  send: LucideSend,
  settings: LucideSettings,
  share: LucideShare2,
  shield: LucideShield,
  'shield-check': LucideShieldCheck,
  smartphone: LucideSmartphone,
  sparkles: LucideSparkles,
  trash: LucideTrash,
  upload: LucideUpload,
  user: LucideUser,
  'user-check': LucideUserCheck,
  'user-plus': LucideUserPlus,
  users: LucideUsers,
  wallet: LucideWallet,
  x: LucideX,
  'x-circle': LucideCircleX,
} as const satisfies Record<string, LucideIcon>;

export type WizzIconName = keyof typeof WIZZ_ICON_MAP;

export function provideWizzIcons(): Provider {
  return provideLucideIcons(...Object.values(WIZZ_ICON_MAP));
}

@Component({
  selector: 'wizz-icon',
  standalone: true,
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [lucideIcon]="resolvedIcon()"
      [size]="size()"
      [strokeWidth]="strokeWidth()"
      [class]="iconClass()"
    />
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 0;
        flex-shrink: 0;
      }
      svg.spin {
        animation: wizz-spin 0.9s linear infinite;
      }
      @keyframes wizz-spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class WizzIconComponent {
  readonly name = input.required<WizzIconName>();
  readonly size = input<number>(18);
  readonly strokeWidth = input<number>(2);
  readonly spin = input<boolean>(false);

  readonly resolvedIcon = computed(() => WIZZ_ICON_MAP[this.name()]);
  readonly iconClass = computed(() => (this.spin() ? 'spin' : ''));
}
