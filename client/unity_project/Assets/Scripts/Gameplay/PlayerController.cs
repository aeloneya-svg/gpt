using UnityEngine;

namespace EchoRift.Gameplay
{
    /// <summary>
    /// Handles parkour movement and build-mode toggling for the vertical slice.
    /// </summary>
    public class PlayerController : MonoBehaviour
    {
        [SerializeField] private CharacterController characterController;
        [SerializeField] private float moveSpeed = 8f;
        [SerializeField] private float jumpHeight = 1.5f;
        [SerializeField] private float gravity = -20f;
        [SerializeField] private float wallRunSpeed = 11f;

        private Vector3 velocity;
        private bool isBuildMode;

        /// <summary>
        /// Toggles build mode to switch between combat movement and placement input.
        /// </summary>
        public void ToggleBuildMode()
        {
            isBuildMode = !isBuildMode;
        }

        private void Update()
        {
            if (isBuildMode)
            {
                return;
            }

            var move = transform.right * Input.GetAxis("Horizontal") + transform.forward * Input.GetAxis("Vertical");
            characterController.Move(move * (moveSpeed * Time.deltaTime));

            if (Input.GetButtonDown("Jump") && characterController.isGrounded)
            {
                velocity.y = Mathf.Sqrt(jumpHeight * -2f * gravity);
            }

            if (Input.GetKey(KeyCode.LeftShift))
            {
                characterController.Move(transform.forward * (wallRunSpeed * Time.deltaTime));
            }

            velocity.y += gravity * Time.deltaTime;
            characterController.Move(velocity * Time.deltaTime);
        }
    }
}
