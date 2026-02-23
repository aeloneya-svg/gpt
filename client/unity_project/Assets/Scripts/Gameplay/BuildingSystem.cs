using UnityEngine;

namespace EchoRift.Gameplay
{
    /// <summary>
    /// Snap-based builder used in Sandbox Hub and quick defensive placements in matches.
    /// </summary>
    public class BuildingSystem : MonoBehaviour
    {
        [SerializeField] private GameObject[] buildPieces;
        [SerializeField] private LayerMask placementLayer;
        [SerializeField] private float snapSize = 1f;

        private int selectedIndex;
        private Quaternion rotation = Quaternion.identity;

        /// <summary>
        /// Rotates the preview object by 90 degrees for modular alignment.
        /// </summary>
        public void RotatePieceClockwise()
        {
            rotation *= Quaternion.Euler(0f, 90f, 0f);
        }

        /// <summary>
        /// Places the currently selected build piece at the raycast hit with snap.
        /// </summary>
        public void PlaceCurrentPiece(Camera cam)
        {
            if (!Physics.Raycast(cam.transform.position, cam.transform.forward, out var hit, 10f, placementLayer))
            {
                return;
            }

            var snapped = new Vector3(
                Mathf.Round(hit.point.x / snapSize) * snapSize,
                Mathf.Round(hit.point.y / snapSize) * snapSize,
                Mathf.Round(hit.point.z / snapSize) * snapSize
            );

            Instantiate(buildPieces[selectedIndex], snapped, rotation);
        }
    }
}
