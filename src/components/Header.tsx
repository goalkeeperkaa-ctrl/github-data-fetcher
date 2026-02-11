import { Search, MapPin, Plus, Heart, Bell, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            A
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Aidagis
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <Search className="h-4 w-4" />
              Мероприятия
            </Button>
          </Link>
          <Link to="/map">
            <Button variant="ghost" size="sm" className="gap-2">
              <MapPin className="h-4 w-4" />
              Карта
            </Button>
          </Link>
          <Link to="/create">
            <Button variant="ghost" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Создать
            </Button>
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
          </Button>
          <Link to="/auth">
            <Button size="sm" className="gap-2">
              <User className="h-4 w-4" />
              Войти
            </Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-card p-4 space-y-2">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Search className="h-4 w-4" />
              Мероприятия
            </Button>
          </Link>
          <Link to="/map" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <MapPin className="h-4 w-4" />
              Карта
            </Button>
          </Link>
          <Link to="/create" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Plus className="h-4 w-4" />
              Создать
            </Button>
          </Link>
          <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
            <Button className="w-full gap-2">
              <User className="h-4 w-4" />
              Войти
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
