<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with('profile');

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));

        return response()->json($users);
    }

    public function show(string $id): JsonResponse
    {
        $user = User::with('profile', 'orders')->findOrFail($id);

        return response()->json(['data' => $user]);
    }

    public function updateRole(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Prevent modifying own role
        if ($request->user()->id === $user->id) {
            return response()->json([
                'message' => 'Vous ne pouvez pas modifier votre propre rôle',
            ], 422);
        }

        $validated = $request->validate([
            'role' => 'required|in:user,admin,super_admin',
        ]);

        // Only super_admin can create super_admin
        if ($validated['role'] === 'super_admin' && !$request->user()->isSuperAdmin()) {
            return response()->json([
                'message' => 'Seul un super admin peut créer un super admin',
            ], 403);
        }

        $user->update(['role' => $validated['role']]);

        return response()->json([
            'data' => $user,
            'message' => 'Rôle mis à jour',
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'name' => 'nullable|string|max:255',
            'role' => 'nullable|in:user,admin,super_admin',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
        ]);

        // Only super_admin can create super_admin
        if (($validated['role'] ?? 'user') === 'super_admin' && !$request->user()->isSuperAdmin()) {
            return response()->json([
                'message' => 'Seul un super admin peut créer un super admin',
            ], 403);
        }

        $user = User::create([
            'name' => $validated['name'] ?? trim(($validated['first_name'] ?? '') . ' ' . ($validated['last_name'] ?? '')),
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? 'user',
        ]);

        Profile::create([
            'user_id' => $user->id,
            'first_name' => $validated['first_name'] ?? null,
            'last_name' => $validated['last_name'] ?? null,
        ]);

        return response()->json([
            'data' => $user->load('profile'),
            'message' => 'Utilisateur créé',
        ], 201);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Prevent deleting self
        if ($request->user()->id === $user->id) {
            return response()->json([
                'message' => 'Vous ne pouvez pas supprimer votre propre compte',
            ], 422);
        }

        // Only super_admin can delete super_admin
        if ($user->isSuperAdmin() && !$request->user()->isSuperAdmin()) {
            return response()->json([
                'message' => 'Seul un super admin peut supprimer un super admin',
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé',
        ]);
    }

    public function stats(): JsonResponse
    {
        $stats = [
            'total' => User::count(),
            'users' => User::where('role', 'user')->count(),
            'admins' => User::where('role', 'admin')->count(),
            'super_admins' => User::where('role', 'super_admin')->count(),
            'today' => User::whereDate('created_at', today())->count(),
            'this_month' => User::whereMonth('created_at', now()->month)->count(),
        ];

        return response()->json(['data' => $stats]);
    }
}
