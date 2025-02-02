/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import Bills from "../containers/Bills.js";
// import {modal} from "../views/DashboardFormUI.js";

import router from "../app/Router.js";
import store from "../__mocks__/store.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
      

    })
    test("Then bills should be ordered from earliest to latest", async () => {
      // -> On simule le localStorage en utilisant localStorageMock
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // -> On simule la connexion d'un compte type employé
      window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
      }))

      // On simule la navigation pour modifier le corp du doc HTML en fonction du chemin
      const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
      }
      const billsContainer = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })
      const bills = await billsContainer.getBills()
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((new Date(a) < new Date(b)) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe('When I click on the icon eye', () => {
      test('A modal should open', () => {

        // -> On simule le localStorage en utilisant localStorageMock
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        // -> On simule la connexion d'un compte type employé
        window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
        }))

        // On simule la navigation pour modifier le corp du doc HTML en fonction du chemin
        const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
        }

        // -> Remplace le corps du document HTML
        document.body.innerHTML = BillsUI({ data: bills })
        
        // -> Création instance Bills en lui passant les données
        const billsInstance = new Bills({
          document, onNavigate, store: null, bills, localStorage: window.localStorage
        })

        // -> On obtient le premier icone à partir du DOM
        const iconEye = screen.getAllByTestId("icon-eye")[0]

        // -> On remplace la fonction jQuery .modal() pour récupérer les appels
        $.fn.modal = jest.fn()

        // -> On crée une fonction espionne
        const handleClickIconEye = jest.fn(billsInstance.handleClickIconEye(iconEye))

        iconEye.addEventListener('click', handleClickIconEye)
        userEvent.click(iconEye)

        expect(handleClickIconEye).toHaveBeenCalled()
        expect($.fn.modal).toHaveBeenCalled()
      })

    })

    test("Then I navigate to NewBill route", () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const bill = new Bills({
        document, onNavigate: jest.fn(), store: null, localStorage: window.localStorage
      })

      bill.handleClickNewBill()

      expect(bill.onNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"])
    })


    test("Then I click on the new bill button", () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const bill = new Bills({
        document, onNavigate: jest.fn(), store: null, localStorage: window.localStorage
      })
      
      const newBillBtn = screen.getByTestId('btn-new-bill')

      const handleClickNewBill = jest.fn(bill.handleClickNewBill())
      newBillBtn.addEventListener('click', handleClickNewBill)

      userEvent.click(newBillBtn)
      expect(handleClickNewBill).toHaveBeenCalled()
      
    
    });

    test('Then I check if a snapshot corresponds to the expected output', async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      // -> Je créer une nouvelle instance de Bills qui me donne accès 
      // à la fonction getBills()
      const bill = new Bills({
        document, onNavigate: jest.fn(), store, localStorage: window.localStorage
      })

      const result = await bill.getBills()

      expect(result[0].date).toEqual("2004-04-04")
    })

  })
    
  describe('When an error occurs on API', () => {
    beforeEach(() => {
      jest.spyOn(mockStore, 'bills')
      Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
      );
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.appendChild(root)
      router()
    })
    test('fetches bills from an API and fails with 404 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 404'));
          }
        }
      })
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)
      const message = await screen.getByTestId('error-message')
      expect(message).toBeTruthy()
    })

    test('fetches messages from an API and fails with 500 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 500'))
          }
        }
      })

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)
      const message = await screen.getByTestId('error-message')
      expect(message).toBeTruthy()
    })
  })

})
