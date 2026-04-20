"use client";

import styles from './page.module.css';
import { useEffect, useState } from 'react';
import api from '../services/api';
import MenuLateral from '../componentes/MenuLateral';
import BarraSuperior from '../componentes/BarraSuperior';
import { CalendarDays, DollarSign, PawPrint, ShoppingCart, Users } from 'lucide-react';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState({
    totalClientes: 0,
    totalPets: 0,
    agendamentosHoje: 0,
    totalVendas: 0,
    faturamentoDia: 0,
  });

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const { data } = await api.get('/dashboard');
        setDashboard({
          totalClientes: data.totalClientes ?? 0,
          totalPets: data.totalPets ?? 0,
          agendamentosHoje: data.agendamentosHoje ?? 0,
          totalVendas: data.totalVendas ?? 0,
          faturamentoDia: data.faturamentoDia ?? 0,
        });
      } catch (err) {
        setDashboard({
          totalClientes: 0,
          totalPets: 0,
          agendamentosHoje: 0,
          totalVendas: 0,
          faturamentoDia: 0,
        });
      }
    }
    fetchDashboard();
  }, []);

  const cards = [
    {
      icon: <Users size={32} color="#2C83ED" />,
      label: 'Total de Clientes',
      value: dashboard.totalClientes,
    },
    {
      icon: <PawPrint size={32} color="#28AF60" />,
      label: 'Total de Pets',
      value: dashboard.totalPets,
    },
    {
      icon: <CalendarDays size={32} color="#000" />,
      label: 'Agendamentos Hoje',
      value: dashboard.agendamentosHoje,
    },
    {
      icon: <ShoppingCart size={32} color="#2C83ED" />,
      label: 'Total de Vendas',
      value: dashboard.totalVendas,
    },
    {
      icon: <DollarSign size={32} color="#28AF60" />,
      label: 'Faturamento do Dia',
      value: `R$ ${Number(dashboard.faturamentoDia).toFixed(2)}`,
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
      <MenuLateral active="Dashboard" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <BarraSuperior />
        <main style={{ flex: 1 }}>
          <div className={styles.container}>
            <h1 className={styles.title}>Dashboard</h1>
            <div className={styles.cardsGrid}>
              {cards.map((card, idx) => (
                <div className={styles.card} key={idx}>
                  <div className={styles.icon}>{card.icon}</div>
                  <div className={styles.info}>
                    <span className={styles.label}>{card.label}</span>
                    <span className={styles.value}>{card.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}