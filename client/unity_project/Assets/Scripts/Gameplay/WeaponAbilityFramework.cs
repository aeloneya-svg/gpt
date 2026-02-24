using System.Collections.Generic;
using UnityEngine;

namespace EchoRift.Gameplay
{
    /// <summary>
    /// Handles equipping modular weapons and ability attachment modifiers.
    /// </summary>
    public class WeaponAbilityFramework : MonoBehaviour
    {
        [SerializeField] private WeaponDefinition equippedWeapon;

        private readonly List<AttachmentDefinition> attachments = new();

        /// <summary>
        /// Equips a weapon definition to this player.
        /// </summary>
        public void EquipWeapon(WeaponDefinition weapon)
        {
            equippedWeapon = weapon;
        }

        /// <summary>
        /// Adds an attachment and reapplies stat modifiers.
        /// </summary>
        public void AddAttachment(AttachmentDefinition attachment)
        {
            attachments.Add(attachment);
        }

        /// <summary>
        /// Fires the equipped weapon with attachment-modified stats.
        /// </summary>
        public void Fire()
        {
            if (equippedWeapon == null)
            {
                return;
            }

            var damage = equippedWeapon.BaseDamage;
            foreach (var attachment in attachments)
            {
                damage += attachment.DamageModifier;
            }

            Debug.Log($"EchoRift fire event. Damage={damage}");
        }
    }

    [CreateAssetMenu(menuName = "EchoRift/Weapon")]
    public class WeaponDefinition : ScriptableObject
    {
        public float BaseDamage = 15f;
    }

    [CreateAssetMenu(menuName = "EchoRift/Attachment")]
    public class AttachmentDefinition : ScriptableObject
    {
        public float DamageModifier = 2f;
    }
}
