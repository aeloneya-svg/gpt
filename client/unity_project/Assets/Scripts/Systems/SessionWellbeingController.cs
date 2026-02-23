using UnityEngine;

namespace EchoRift.Systems
{
    /// <summary>
    /// Provides in-session reminders and optional daily play limit notifications.
    /// </summary>
    public class SessionWellbeingController : MonoBehaviour
    {
        [SerializeField] private int sessionReminderMinutes = 45;
        [SerializeField] private int dailyLimitMinutes = 120;
        [SerializeField] private bool remindersEnabled = true;

        private float elapsedSeconds;
        private bool dailyWarningShown;

        /// <summary>
        /// Applies account well-being settings from profile sync.
        /// </summary>
        public void Configure(int reminderMinutes, int limitMinutes, bool enableReminders)
        {
            sessionReminderMinutes = reminderMinutes;
            dailyLimitMinutes = limitMinutes;
            remindersEnabled = enableReminders;
        }

        private void Update()
        {
            elapsedSeconds += Time.deltaTime;
            if (!remindersEnabled)
            {
                return;
            }

            if (elapsedSeconds >= sessionReminderMinutes * 60f && elapsedSeconds < sessionReminderMinutes * 60f + 1f)
            {
                Debug.Log("Session reminder: Consider taking a break.");
            }

            if (!dailyWarningShown && elapsedSeconds >= dailyLimitMinutes * 60f)
            {
                dailyWarningShown = true;
                Debug.Log("Daily limit reached. Optional cool-down prompt displayed.");
            }
        }
    }
}
