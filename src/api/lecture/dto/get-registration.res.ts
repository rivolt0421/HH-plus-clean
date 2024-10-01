import { Registration } from 'src/domain/register/register';
import { Slot } from 'src/domain/slot/slot';

export class RegisteredDto {
  id: number;
  lectureTitle: string;
  lectureSpeakerName: string;

  constructor(registration: Registration, slot: Slot) {
    this.id = registration.id;
    this.lectureTitle = slot.title;
    this.lectureSpeakerName = slot.speakerName;
  }
}
