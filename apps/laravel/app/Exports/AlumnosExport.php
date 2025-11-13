<?php

namespace App\Exports;

use App\Models\Alumno;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class AlumnosExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
{
    protected $request;

    /**
     * Recibimos el request completo con todos los filtros
     * @param \Illuminate\Http\Request $request
     */
    public function __construct($request)
    {
        $this->request = $request;
    }

    /**
     * Definimos la consulta base, aplicando los mismos filtros que en el index
     * Esta es la clave para que respete los filtros del usuario
     */
    public function query()
    {
        // Usamos exactamente la misma lógica de filtrado que en AlumnoController@index
        // Esto asegura que la exportación respete todos los filtros aplicados
        return QueryBuilder::for(Alumno::class)
            ->allowedFilters([
                'nombre',
                'apellido_paterno',
                'apellido_materno',
                'matricula',
                'semestre',
                'genero',
                'modalidad',
                AllowedFilter::exact('carrera_id'),
                AllowedFilter::exact('usuario_id'),
                AllowedFilter::exact('estatus_alumno'),
                AllowedFilter::exact('genero'),
                AllowedFilter::exact('modalidad'),
            ])
            ->allowedSorts(['nombre', 'apellido_paterno', 'matricula', 'semestre', 'created_at'])
            ->allowedIncludes(['usuario', 'carrera', 'inscripciones'])
            ->with(['carrera', 'usuario']); // Cargamos las relaciones necesarias
    }

    /**
     * Definimos la fila de cabeceras del Excel/CSV
     */
    public function headings(): array
    {
        return [
            'Matrícula',
            'Nombre',
            'Apellido Paterno',
            'Apellido Materno',
            'Fecha de Nacimiento',
            'Carrera',
            'Semestre',
            'Género',
            'Modalidad',
            'Estatus',
            'Email',
            'Fecha de Registro',
        ];
    }

    /**
     * Mapeamos los datos de cada alumno a una fila del archivo
     * @param \App\Models\Alumno $alumno
     */
    public function map($alumno): array
    {
        return [
            $alumno->matricula,
            $alumno->nombre,
            $alumno->apellido_paterno,
            $alumno->apellido_materno,
            $alumno->fecha_nacimiento ? \Illuminate\Support\Carbon::parse($alumno->fecha_nacimiento)->format('Y-m-d') : 'N/A',
            $alumno->carrera->nombre ?? 'N/A',
            $alumno->semestre,
            $alumno->genero,
            $alumno->modalidad,
            $alumno->estatus_alumno,
            $alumno->usuario->email ?? 'N/A',
            $alumno->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
