import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils-fixed';
import DashboardIndex from '../../../pages/dashboard/index';
import ViewerDashboard from '../../../pages/dashboard/viewer/index';
import '@testing-library/jest-dom';

// These tests are simple but demonstrate how to use the new utility

describe('Dashboard Pages Render Tests', () => {
  describe('Dashboard Index', () => {
    it('should render when authenticated', () => {
      renderWithProviders(<DashboardIndex />, { authenticated: true });
      expect(document.body.textContent).toBeTruthy();
    });

    it('should handle unauthenticated state', () => {
      renderWithProviders(<DashboardIndex />, { authenticated: false });
      expect(document.body.textContent).toBeTruthy();
    });
  });
  
  describe('Dashboard with Different Roles', () => {
    it('should render when authenticated with viewer role', () => {
      renderWithProviders(<DashboardIndex />, { 
        authenticated: true,
        initialRole: 'viewer'
      });
      expect(document.body.textContent).toBeTruthy();
    });
    
    it('should render when authenticated with advertiser role', () => {
      renderWithProviders(<DashboardIndex />, { 
        authenticated: true,
        initialRole: 'advertiser'
      });
      expect(document.body.textContent).toBeTruthy();
    });

    it('should render when authenticated with publisher role', () => {
      renderWithProviders(<DashboardIndex />, { 
        authenticated: true,
        initialRole: 'publisher'
      });
      expect(document.body.textContent).toBeTruthy();
    });
    
    it('should render when authenticated with admin role', () => {
      renderWithProviders(<DashboardIndex />, { 
        authenticated: true,
        initialRole: 'admin'
      });
      expect(document.body.textContent).toBeTruthy();
    });
  });
  
  describe('Viewer Dashboard Page', () => {
    it('should render the viewer dashboard page', () => {
      renderWithProviders(<ViewerDashboard />, { 
        authenticated: true,
        initialRole: 'viewer'
      });
      expect(document.body.textContent).toBeTruthy();
    });
  });
});