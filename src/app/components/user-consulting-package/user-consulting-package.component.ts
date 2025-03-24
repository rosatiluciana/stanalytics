import { Component, OnInit } from '@angular/core';
import { bootstrapBox2Fill } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { NgxPayPalModule, IPayPalConfig } from 'ngx-paypal';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { AuthService } from '../../services/auth.service';

type Level = 'bronze' | 'silver' | 'gold';

@Component({
  selector: 'app-user-consulting-package',
  templateUrl: './user-consulting-package.component.html',
  styleUrls: ['./user-consulting-package.component.css'],
  standalone: true,
  imports: [
    NgIcon,
    CommonModule,
    NgxPayPalModule,
    CurrencyPipe,
    FormsModule
  ],
  providers: [
    provideIcons({
      bootstrapBox2Fill
    })
  ]
})
export class UserConsultingPackageComponent implements OnInit {
  public selectedPackage: string = '';
  public payPalConfigBronze?: IPayPalConfig;
  public payPalConfigSilver?: IPayPalConfig;
  public payPalConfigGold?: IPayPalConfig;

  public transactionStatus: 'success' | 'error' | 'none' = 'none';
  public transactionMessage: string = '';

  public ngOnInit(): void {
    this.initConfigBronze();
    this.initConfigSilver();
    this.initConfigGold();
  }

  public constructor(private transactionService: TransactionService, private authService: AuthService) { }

  private initConfigBronze(): void {
    this.payPalConfigBronze = this.createPayPalConfig('Pacchetto bronze', '239.00');
  }

  private initConfigSilver(): void {
    this.payPalConfigSilver = this.createPayPalConfig('Pacchetto silver', '479.00');
  }

  private initConfigGold(): void {
    this.payPalConfigGold = this.createPayPalConfig('Pacchetto gold', '739.00');
  }

  private createPayPalConfig(name: string, price: string): IPayPalConfig {
    return {
      currency: 'EUR',
      clientId: 'AS690Yj-oYGF3qVvdd8rJPmEJfzHM3ymppE1PrLAXmxQGnZ7esyqv2xj9g927Swpeo0a54gH4Xhak3oP',
      createOrderOnClient: () => ({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'EUR',
            value: price,
            breakdown: {
              item_total: {
                currency_code: 'EUR',
                value: price
              }
            }
          },
          items: [{
            name: name,
            quantity: '1',
            category: 'DIGITAL_GOODS',
            unit_amount: {
              currency_code: 'EUR',
              value: price,
            },
          }]
        }]
      }),
      advanced: {
        commit: 'true'
      },
      style: {
        label: 'paypal',
        layout: 'horizontal',
        color: 'blue',
        shape: 'pill',
        tagline: false,
      },
      onApprove: (data, actions) => {
        return actions.order.capture().then((details: any) => {
          this.transactionStatus = 'success';
          this.transactionMessage = 'Pagamento andato a buon fine!';
        });
      },
      onClientAuthorization: (data) => {
        try {
          this.transactionService.createTransaction(
            {
              productName: `Pacchetto ${this.getPackageLevel(this.selectedPackage).toLowerCase()}`,
              date: new Date(),
              amount: this.getPackagePrice(this.selectedPackage).toString(),
              level: this.getPackageLevel(this.selectedPackage).toLowerCase() as Level,
              status: 'Completato',
              userId: this.authService.getUserId()!
            });
          this.transactionStatus = 'success';
          this.transactionMessage = 'Transazione creata con successo!';
        } catch (error) {
          this.transactionStatus = 'error';
          this.transactionMessage = 'Errore durante la creazione della transazione.';
        }
      },
      onCancel: (data, actions) => {
        try {
          this.transactionService.createTransaction(
            {
              productName: `Pacchetto ${this.getPackageLevel(this.selectedPackage).toLowerCase()}`,
              date: new Date(),
              amount: this.getPackagePrice(this.selectedPackage).toString(),
              level: this.getPackageLevel(this.selectedPackage).toLowerCase() as Level,
              status: 'Annullato',
              userId: this.authService.getUserId()!
            });
          this.transactionStatus = 'error';
          this.transactionMessage = 'Pagamento annullato.';
        } catch (error) {
          this.transactionStatus = 'error';
          this.transactionMessage = 'Errore durante la creazione della transazione.';
        }
      },
      onError: (err) => {
        this.transactionStatus = 'error';
        this.transactionMessage = 'Errore durante il pagamento.';
      }
    };
  }

  public getPayPalConfig(packageName: string): IPayPalConfig | undefined {
    switch (packageName) {
      case 'bronze':
        return this.payPalConfigBronze;
      case 'silver':
        return this.payPalConfigSilver;
      case 'gold':
        return this.payPalConfigGold;
      default:
        return undefined;
    }
  }

  public getPackageLevel(packageName: string): string {
    switch (packageName) {
      case 'bronze':
        return 'BRONZE';
      case 'silver':
        return 'SILVER';
      case 'gold':
        return 'GOLD';
      default:
        return '';
    }
  }

  public getPackagePrice(packageName: string): number {
    switch (packageName) {
      case 'bronze':
        return 239;
      case 'silver':
        return 479;
      case 'gold':
        return 739;
      default:
        return 0;
    }
  }

  public getPackageColor(packageName: string): string {
    switch (packageName) {
      case 'bronze':
        return '#CD7F32';
      case 'silver':
        return '#C0C0C0';
      case 'gold':
        return '#FFD700';
      default:
        return '#FFFFFF';
    }
  }

  public getDescription(packageName: string): string {
    switch (packageName) {
      case 'bronze':
        return 'Abbonamento mensile';
      case 'silver':
        return 'Abbonamento trimestrale';
      case 'gold':
        return 'Abbonamento semestrale';
      default:
        return 'Istruzioni operative online';
    }
  }
}