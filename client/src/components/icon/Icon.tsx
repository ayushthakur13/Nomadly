import {
  Plus,
  Trash2,
  Edit,
  Search,
  Map,
  User,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Loader,
  CheckCircle,
  Upload,
  X,
  MapPin,
  ImageIcon,
  Clock,
  Bookmark,
  Share2,
  Users,
  Home,
  Compass,
  Sparkles,
  LogOut,
  ArrowRight,
  Lock,
  Globe,
  Menu,
  Settings,
  HelpCircle,
  Quote,
  Sun,
  Moon,
  Bell,
  Plane,
  LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  add: Plus,
  delete: Trash2,
  edit: Edit,
  search: Search,
  map: Map,
  user: User,
  calendar: Calendar,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  eye: Eye,
  eyeOff: EyeOff,
  loader: Loader,
  checkCircle: CheckCircle,
  upload: Upload,
  close: X,
  location: MapPin,
  image: ImageIcon,
  clock: Clock,
  bookmark: Bookmark,
  share: Share2,
  users: Users,
  home: Home,
  compass: Compass,
  sparkles: Sparkles,
  menu: Menu,
  settings: Settings,
  help: HelpCircle,
  quote: Quote,
  sun: Sun,
  moon: Moon,
  bell: Bell,
  logout: LogOut,
  arrowRight: ArrowRight,
  lock: Lock,
  globe: Globe,
  plane: Plane
};

type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export default function Icon({
  name,
  size = 20,
  className,
}: IconProps) {
  const IconComponent = ICONS[name];
  if (!IconComponent) return null;

  return <IconComponent size={size} className={className} />;
}
