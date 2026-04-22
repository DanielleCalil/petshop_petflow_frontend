"use client";

import styles from "./menu.module.css";
import {
  Users,
  Scissors,
  CalendarDays,
  ShoppingCart,
  LayoutDashboard,
  PawPrint,
  Package,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const menuItems = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={22} />,
    href: "/",
  },
  { label: "Clientes", icon: <Users size={22} />, href: "/clientes" },
  { label: "Pets", icon: <PawPrint size={22} />, href: "/pets" },
  { label: "Serviços", icon: <Scissors size={22} />, href: "/servicos" },
  {
    label: "Agendamentos",
    icon: <CalendarDays size={22} />,
    href: "/agendamentos",
  },
  { label: "Produtos", icon: <Package size={22} />, href: "/produtos" },
  { label: "Vendas", icon: <ShoppingCart size={22} />, href: "/vendas" },
];

export default function MenuLateral({ active }) {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("Gerenciamento Petshop - PetFlow");
    router.replace("/login");
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoArea}>
        <Image
          src="/logo_petflow_sem_fundo.png"
          alt="PetFlow Logo"
          width={175}
          height={50}
        />
      </div>
      <div className={styles.divisor} />
      <nav className={styles.navArea}>
        <ul className={styles.menuList}>
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={
                  active === item.label ? styles.active : styles.menuItem
                }
              >
                <span className={styles.icon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.logoutArea}>
        <button
          type="button"
          onClick={handleLogout}
          className={styles.logoutButton}
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
