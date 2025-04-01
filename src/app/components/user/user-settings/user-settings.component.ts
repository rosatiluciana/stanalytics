import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { AuthService } from '../../../services/auth.service';
import { bootstrapExclamationTriangleFill, bootstrapEye, bootstrapEyeSlash, bootstrapGearWideConnected, bootstrapPersonFill } from '@ng-icons/bootstrap-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Utente } from '../../../model/utente';
import { TransazioneService } from '../../../services/transazione.service';
import { UtenteService } from '../../../services/utente.service';
import { Router } from '@angular/router';
import { auth } from '../../../../environment/firebase';

// Tipo per i messaggi di notifica
type tipoDiMessaggio = 'success' | 'info' | 'warning' | 'danger' | 'primary' | 'secondary' | 'light' | 'dark';

@Component({
  selector: 'app-user-settings',
  imports: [
    ReactiveFormsModule,
    NgIcon
  ],
  providers: [
    provideIcons({
      bootstrapGearWideConnected,
      bootstrapEyeSlash,
      bootstrapEye,
      bootstrapExclamationTriangleFill,
      bootstrapPersonFill
    })
  ],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.css'
})

export class UserSettingsComponent {

  public tipo = 'info';
  public isVisibile = false;
  public messaggio = '';

  public isPasswordEmailCorrente: boolean = false;
  public isPasswordCorrente: boolean = false;

  public loadingEmail: boolean = false;
  public loadingPassword: boolean = false;

  private modalService = inject(NgbModal);

  public constructor(private router: Router, private authService: AuthService, private transazioneService: TransazioneService, private utenteService: UtenteService) { }

  public formAggiornaAccount = new FormGroup({
    aggiornaEmail: new FormControl('', [Validators.required, Validators.email]),
    passwordEmailCorrente: new FormControl('', Validators.required),
  });
  public get aggiornaEmail() {
    return this.formAggiornaAccount.get('aggiornaEmail');
  }
  public get passwordEmailCorrente() {
    return this.formAggiornaAccount.get('passwordEmailCorrente');
  }

  public formAggiornaPassword = new FormGroup({
    passwordCorrente: new FormControl('', Validators.required),
    nuovaPassword: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?=.{6,}).+$/)])
  });
  public get passwordCorrente() {
    return this.formAggiornaPassword.get('passwordCorrente');
  }
  public get nuovaPassword() {
    return this.formAggiornaPassword.get('nuovaPassword');
  }

  public async onAggiornaEmail(): Promise<void> {
    this.loadingEmail = true;
    try {
      if (this.aggiornaEmail?.value && this.passwordEmailCorrente?.value) {
        await this.authService.updateEmail(this.aggiornaEmail.value, this.passwordEmailCorrente.value);
        this.loadingEmail = false;
        this.inviaMessaggio('Controlla la tua casella di posta per verificare l\'email.\nControlla anche nello spam!', 'success');
        this.resetForm(this.formAggiornaAccount);
      }

    } catch (error: any) {
      this.loadingEmail = false;
      if (error.code === 'auth/invalid-credential' || typeof error === 'string' && error.includes('auth/invalid-credential')) {
        this.inviaMessaggio('La password attuale non è corretta', 'warning', false);
        this.resetForm(this.formAggiornaAccount);
      } else { this.inviaMessaggio(error + '', 'danger', false); }
    }
  }

  public async onAggiornaPassword(): Promise<void> {
    this.loadingPassword = true;
    try {
      
      if (this.passwordCorrente?.value && this.nuovaPassword?.value) {
        await this.authService.updatePassword(this.passwordCorrente.value, this.nuovaPassword.value);
        this.loadingPassword = false;
        this.inviaMessaggio('Password aggiornata correttamente', 'success');
        await this.resetForm(this.formAggiornaPassword);
        this.authService.logout();
      }

    } catch (error: any) {
      this.loadingPassword = false;
      if (error.code === 'auth/invalid-credential' || typeof error === 'string' && error.includes('auth/invalid-credential')) {
        this.inviaMessaggio('La password attuale non è corretta', 'warning', false);
        this.resetForm(this.formAggiornaPassword);
      } else { this.inviaMessaggio(error + '', 'danger', false); }
    }
  }

  public apriModale(contenuto: any): void {
    const modalRef = this.modalService.open(contenuto, { centered: true });
    modalRef.result.then(async (risultato) => {
      const utenteCorrente = this.authService.getUtenteCorrente();
      if (risultato === 'confirm') {
        await this.eliminaAccount(utenteCorrente!.uid);
        await this.authService.deleteAccount();
      }
    },
      () => { this.inviaMessaggio('Operazione annullata', 'info'); }
    );
  }

  public visualizzaPasswordCorrente() {
    this.isPasswordCorrente = !this.isPasswordCorrente;
  }

  public visualizzaPasswordEmailCorrente() {
    this.isPasswordEmailCorrente = !this.isPasswordEmailCorrente;
  }

  private async eliminaAccount(idUtente: string): Promise<void> {
    try {
      this.router.navigate(['/login']);
      await this.transazioneService.cancellaTransazioni(idUtente);
      await this.utenteService.deleteUtente(idUtente);
    } catch (error) {
      console.log('Errore durante l\'eliminazione dell\'utente: ' + error);
    }
  }

  private inviaMessaggio(messaggio: string, tipo: tipoDiMessaggio, timer: boolean = true): void {
    this.tipo = tipo;
    this.isVisibile = true;
    this.messaggio = messaggio;
    if (timer) {
      setTimeout(() => {
        this.isVisibile = false;
        this.messaggio = '';
      }, 5000)
    }
  }

  private async resetForm(formDaResettare: FormGroup) {
    setTimeout(() => {
      formDaResettare.reset();
    }, 5000);
  }

}
