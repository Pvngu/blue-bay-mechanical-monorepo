<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClientRequest;
use App\Http\Traits\HasPagination;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class ClientController extends Controller
{
    use HasPagination;

    public function index(): JsonResponse
    {
        $clients = QueryBuilder::for(Client::class)
            ->allowedFilters([
                'client_code',
                'name',
                'email',
                'phone',
                'city',
                'state',
                'country',
                'preferred_contact',
                'preferred_language',
                AllowedFilter::exact('is_active'),
            ])
            ->allowedSorts(['client_code', 'name', 'last_service_date', 'created_at'])
            ->allowedIncludes(['jobs'])
            ->paginate($this->getPageSize());

        return response()->json($clients);
    }

    public function store(ClientRequest $request): JsonResponse
    {
        $client = Client::create($request->validated());
        return response()->json($client, 201);
    }

    public function show(Client $client): JsonResponse
    {
        return response()->json($client);
    }

    public function update(ClientRequest $request, Client $client): JsonResponse
    {
        $client->update($request->validated());
        return response()->json($client);
    }

    public function destroy(Client $client): JsonResponse
    {
        $client->delete();
        return response()->json(null, 204);
    }
}
