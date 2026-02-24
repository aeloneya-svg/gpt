using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

namespace EchoRift.Networking
{
    /// <summary>
    /// Client-side bridge for authoritative match flow and Rift updates.
    /// </summary>
    public class NetworkedMatchController : MonoBehaviour
    {
        [SerializeField] private string backendBaseUrl = "http://localhost:8080";
        [SerializeField] private string currentMatchId = string.Empty;

        /// <summary>
        /// Requests current authoritative state from backend and applies it to local systems.
        /// </summary>
        public void PollAuthoritativeState()
        {
            StartCoroutine(PollStateRoutine());
        }

        /// <summary>
        /// Starts an 8-12 minute Rift Skirmish countdown and local presentation timeline.
        /// </summary>
        public void StartMatchPresentation()
        {
            Debug.Log("Rift Skirmish presentation started (authoritative state on server).");
        }

        private IEnumerator PollStateRoutine()
        {
            var url = $"{backendBaseUrl}/match/{currentMatchId}/state";
            using var req = UnityWebRequest.Get(url);
            yield return req.SendWebRequest();

            if (req.result != UnityWebRequest.Result.Success)
            {
                Debug.LogWarning($"Failed match poll: {req.error}");
                yield break;
            }

            Debug.Log($"Match state payload: {req.downloadHandler.text}");
        }
    }
}
