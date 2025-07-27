
"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Moon, Sun, Users, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

export function UserNav() {
  const { theme, setTheme } = useTheme();
  const { user, users, login, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <Image
              src={`https://placehold.co/40x40.png?text=${user?.name.charAt(0) || 'U'}`}
              alt={user?.name || 'User avatar'}
              width={40}
              height={40}
              data-ai-hint="user avatar"
            />
            <AvatarFallback>{user?.name.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/profile">
            <DropdownMenuItem>Profile</DropdownMenuItem>
          </Link>
          {user?.role === 'Admin' && (
            <Link href="/settings">
                <DropdownMenuItem>Settings</DropdownMenuItem>
            </Link>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <Users className="mr-2 h-4 w-4" />
                <span>Switch User</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup value={user?.id} onValueChange={(id) => login(id)}>
                         {users.map((u) => (
                            <DropdownMenuRadioItem key={u.id} value={u.id}>{u.name}</DropdownMenuRadioItem>
                         ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>

         <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <div className="flex w-full items-center justify-between">
                <Label htmlFor="dark-mode" className="flex items-center gap-2 font-normal">
                    {theme === 'dark' ? <Moon /> : <Sun />}
                    <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                </Label>
                <Switch
                    id="dark-mode"
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
            </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
