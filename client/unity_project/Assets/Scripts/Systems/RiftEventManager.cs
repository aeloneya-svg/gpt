using UnityEngine;

namespace EchoRift.Systems
{
    /// <summary>
    /// Applies current Rift modifier to local gameplay presentation and tuning.
    /// </summary>
    public class RiftEventManager : MonoBehaviour
    {
        [SerializeField] private string activeModifier = "LOW_GRAVITY";
        [SerializeField] private float activeIntensity = 1f;

        /// <summary>
        /// Applies a new modifier from authoritative backend state.
        /// </summary>
        public void ApplyModifier(string modifier, float intensity)
        {
            activeModifier = modifier;
            activeIntensity = intensity;
            Debug.Log($"Applied Rift modifier {activeModifier} intensity {activeIntensity}");
        }
    }
}
