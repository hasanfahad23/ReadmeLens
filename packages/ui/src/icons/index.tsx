import React from 'react';
import {
  Copy as LucideCopy,
  Check as LucideCheck,
  CheckCircle2 as LucideCheckCircle2,
  ExternalLink as LucideExternalLink,
  Search as LucideSearch,
  Settings as LucideSettings,
  Sun as LucideSun,
  Moon as LucideMoon,
  Monitor as LucideMonitor,
  Menu as LucideMenu,
  X as LucideX,
  AlertTriangle as LucideAlertTriangle,
  AlertCircle as LucideAlertCircle,
  Info as LucideInfo,
  FileText as LucideFileText,
  Folder as LucideFolder,
  Link as LucideLink,
  Download as LucideDownload,
  Share2 as LucideShare2,
  Printer as LucidePrinter,
  Terminal as LucideTerminal,
  Shield as LucideShield,
  Code2 as LucideCode2,
  BookOpen as LucideBookOpen,
  Clock as LucideClock,
  Layers as LucideLayers,
  ArrowRight as LucideArrowRight,
  type LucideProps,
} from 'lucide-react';

export type IconSize = 16 | 20 | 24;

export interface IconProps extends Omit<LucideProps, 'size'> {
  size?: IconSize;
  className?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}

function createIcon(Component: React.ComponentType<LucideProps>) {
  return function IconWrapper({
    size = 20,
    strokeWidth = 2,
    color = 'currentColor',
    'aria-hidden': ariaHidden = true,
    className,
    ...props
  }: IconProps) {
    return (
      <Component
        size={size}
        strokeWidth={strokeWidth}
        color={color}
        aria-hidden={ariaHidden}
        className={className}
        {...props}
      />
    );
  };
}

export const IconCopy = createIcon(LucideCopy);
export const IconCheck = createIcon(LucideCheck);
export const IconCheckCircle = createIcon(LucideCheckCircle2);
export const IconExternalLink = createIcon(LucideExternalLink);
export const IconSearch = createIcon(LucideSearch);
export const IconSettings = createIcon(LucideSettings);
export const IconSun = createIcon(LucideSun);
export const IconMoon = createIcon(LucideMoon);
export const IconMonitor = createIcon(LucideMonitor);
export const IconMenu = createIcon(LucideMenu);
export const IconClose = createIcon(LucideX);
export const IconAlertTriangle = createIcon(LucideAlertTriangle);
export const IconAlertCircle = createIcon(LucideAlertCircle);
export const IconInfo = createIcon(LucideInfo);
export const IconFile = createIcon(LucideFileText);
export const IconFolder = createIcon(LucideFolder);
export const IconLink = createIcon(LucideLink);
export const IconDownload = createIcon(LucideDownload);
export const IconShare = createIcon(LucideShare2);
export const IconPrint = createIcon(LucidePrinter);
export const IconTerminal = createIcon(LucideTerminal);
export const IconShield = createIcon(LucideShield);
export const IconCode = createIcon(LucideCode2);
export const IconBook = createIcon(LucideBookOpen);
export const IconClock = createIcon(LucideClock);
export const IconLayers = createIcon(LucideLayers);
export const IconArrowRight = createIcon(LucideArrowRight);
