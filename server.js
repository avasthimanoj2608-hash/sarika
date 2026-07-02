/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Hostinger / Production entry point
// This root-level file redirects execution to our optimized bundled backend server inside dist/
// This ensures that shared hosting environments (like Hostinger, cPanel, Plesk, etc.)
// which expect the main startup script in the root directory can start the application out-of-the-box.

import './dist/server.cjs';
