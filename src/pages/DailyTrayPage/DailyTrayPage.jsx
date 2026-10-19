// src/pages/DailyTrayPage/DailyTrayPage.jsx
//
// HU-5 · Bandeja del día (mockups 5.1, 5.2 y 5.3).
// La página solo compone: el día vive en la URL (useDateParam) y el estado
// de la bandeja en DailyTrayProvider, que los componentes leen con
// useDailyTray() sin pasar props por varios niveles.
// En desarrollo se puede simular la hora: /encargado/bandeja?hora=10:08

import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import TrayHeader from '../../components/features/operation/tray/TrayHeader';
import TrayBody from '../../components/features/operation/tray/TrayBody';
import { DailyTrayProvider } from '../../context/DailyTrayProvider';
import useDateParam from '../../hooks/useDateParam';

export default function DailyTrayPage() {
  const { date, today, setDate } = useDateParam();

  return (
    <ContentLayout screen="managerTray">
      <DailyTrayProvider date={date}>
        <TrayHeader today={today} onChangeDate={setDate} />
        <TrayBody onGoToDate={setDate} />
      </DailyTrayProvider>
    </ContentLayout>
  );
}
