/**
 * @jest-environment jsdom
 */
import {screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { bills } from "../fixtures/bills.js"
import router from "../app/Router.js";
import store from "../__mocks__/store.js";
import fs from 'fs'
import path from "path";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then I click on choose file", () => {
      // -> On simule le localStorage en utilisant localStorageMock
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // -> On simule la connexion d'un compte type employé
      window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
      }))

      // -> Remplace le corps du document HTML
      document.body.innerHTML = NewBillUI()
      

      // -> On obtient le premier icone à partir du DOM
      const file = screen.getByTestId("file")

      // -> On crée une fonction espionne
      const handleChangeFile = jest.fn()

     file.addEventListener('click', handleChangeFile)
     userEvent.click(file)

      expect(handleChangeFile).toHaveBeenCalled()
    })

    test("Then I upload the bill it's valid", () => { // A COMMENTER
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI()

      const newBill = new NewBill({
        document, onNavigate: null, store, bills, localStorage: window.localStorage
      })
      const file = screen.getByTestId("file")
      
      const fileFake = new File([''], 'fake-file.png', { type: 'image/png' })

      userEvent.upload(file, fileFake)

      expect(file.files.length).toBe(1);

      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)

      file.addEventListener('click', handleChangeFile)
      userEvent.click(file)

      expect(handleChangeFile).toHaveBeenCalled()

      expect(file.files[0].type).toBe('image/png')
    })

    test("Then I upload the bill it's invalid", () => { // A COMMENTER
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI()

      const newBill = new NewBill({
        document, onNavigate: null, store, bills, localStorage: window.localStorage
      })
      const file = screen.getByTestId("file")
      
      const fileFake = new File([''], 'fake-file.txt', { type: 'text/plain' })

      userEvent.upload(file, fileFake)

      expect(file.files.length).toBe(1);


      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)

 

      file.addEventListener('click', handleChangeFile)
      userEvent.click(file)


      expect(handleChangeFile).toHaveBeenCalled()

      expect(file.reportValidity()).not.toBeTruthy()

    })

    // test("Then I click on the send button", () => {

    // })

    // test("Then I send my form data", () => {

    // })
  })
})
